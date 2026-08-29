import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from ..auth import get_current_user_id, require_staff
from ..config import settings
from ..limiter import limiter
from ..supabase_client import get_service_client

router = APIRouter(prefix="/api/tickets", tags=["tickets"])
stripe.api_key = settings.stripe_secret_key


class CheckoutRequest(BaseModel):
    tier_id: str


@router.get("/mine")
def list_my_tickets(user_id: str = Depends(get_current_user_id)):
    client = get_service_client()
    res = (
        client.table("tickets")
        .select("id, status, qr_secret, purchased_at, checked_in_at, ticket_tiers(name, price_cents, currency)")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


@router.post("/checkout")
@limiter.limit("10/minute")
def create_checkout_session(request: Request, body: CheckoutRequest, user_id: str = Depends(get_current_user_id)):
    """Reserves a seat, then hands the buyer to Stripe Checkout. Stripe owns
    card entry and PCI compliance entirely. We never see card numbers."""
    client = get_service_client()
    tier = client.table("ticket_tiers").select("*").eq("id", body.tier_id).single().execute().data
    if not tier:
        raise HTTPException(status_code=404, detail="Ticket tier not found")

    try:
        reservation = client.rpc(
            "reserve_ticket_tier", {"p_tier_id": body.tier_id, "p_user_id": user_id}
        ).execute()
    except Exception as exc:
        if "sold_out" in str(exc):
            raise HTTPException(status_code=409, detail="This ticket tier is sold out")
        raise HTTPException(status_code=400, detail="Could not reserve a ticket")
    ticket_id = reservation.data

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": tier["currency"],
                        "unit_amount": tier["price_cents"],
                        "product_data": {"name": f"Primadonis: {tier['name']}"},
                    },
                    "quantity": 1,
                }
            ],
            payment_method_types=["card"],
            success_url=f"{settings.frontend_url}/tickets?purchase=success",
            cancel_url=f"{settings.frontend_url}/tickets?purchase=cancelled",
            metadata={"ticket_id": ticket_id},
            expires_at=None,
        )
    except Exception:
        client.rpc("release_ticket_reservation", {"p_ticket_id": ticket_id}).execute()
        raise HTTPException(status_code=502, detail="Payment provider error, please retry")

    client.table("tickets").update({"stripe_checkout_session_id": session.id}).eq("id", ticket_id).execute()
    return {"checkout_url": session.url}


class EtransferRequest(BaseModel):
    tier_id: str


@router.post("/etransfer")
@limiter.limit("10/minute")
def create_etransfer_reservation(request: Request, body: EtransferRequest, user_id: str = Depends(get_current_user_id)):
    """Fallback for students who'd rather pay by Interac e-Transfer than
    card. Stripe doesn't clear e-Transfers, so this reserves the seat and
    marks it pending manual confirmation by an event organizer once the
    e-Transfer lands. See /api/tickets/etransfer/{id}/confirm."""
    client = get_service_client()
    try:
        reservation = client.rpc(
            "reserve_ticket_tier", {"p_tier_id": body.tier_id, "p_user_id": user_id}
        ).execute()
    except Exception as exc:
        if "sold_out" in str(exc):
            raise HTTPException(status_code=409, detail="This ticket tier is sold out")
        raise HTTPException(status_code=400, detail="Could not reserve a ticket")
    ticket_id = reservation.data
    client.table("tickets").update({"status": "pending_etransfer"}).eq("id", ticket_id).execute()
    return {"ticket_id": ticket_id, "instructions": "e-Transfer the ticket price to tickets@primadonis.example with your name in the message. Your ticket activates once an organizer confirms receipt."}


@router.post("/etransfer/{ticket_id}/confirm")
def confirm_etransfer(ticket_id: str, user_id: str = Depends(get_current_user_id)):
    require_staff(user_id)
    client = get_service_client()
    client.rpc(
        "confirm_ticket_paid",
        {"p_ticket_id": ticket_id, "p_session_id": None, "p_payment_intent_id": None},
    ).execute()
    return {"ok": True}


@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        ticket_id = session.get("metadata", {}).get("ticket_id")
        if ticket_id:
            client = get_service_client()
            client.rpc(
                "confirm_ticket_paid",
                {
                    "p_ticket_id": ticket_id,
                    "p_session_id": session.get("id"),
                    "p_payment_intent_id": session.get("payment_intent"),
                },
            ).execute()
    elif event["type"] in ("checkout.session.expired",):
        session = event["data"]["object"]
        ticket_id = session.get("metadata", {}).get("ticket_id")
        if ticket_id:
            get_service_client().rpc("release_ticket_reservation", {"p_ticket_id": ticket_id}).execute()

    return {"received": True}


class CheckInRequest(BaseModel):
    qr_secret: str


@router.post("/checkin")
@limiter.limit("60/minute")
def check_in(request: Request, body: CheckInRequest, user_id: str = Depends(get_current_user_id)):
    """Door scan. Staff-only. Atomic single-use via check_in_ticket() so two
    staff phones scanning the same QR at once can't both admit it."""
    require_staff(user_id)
    client = get_service_client()
    result = client.rpc("check_in_ticket", {"p_qr_secret": body.qr_secret, "p_staff_id": user_id}).execute()
    if not result.data:
        existing = client.table("tickets").select("status").eq("qr_secret", body.qr_secret).execute().data
        if existing and existing[0]["status"] == "checked_in":
            raise HTTPException(status_code=409, detail="Ticket already checked in")
        raise HTTPException(status_code=404, detail="Ticket not found or not paid")
    return {"ok": True, "ticket": result.data}
