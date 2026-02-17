/* Degree Progress Section */
.degree-progress-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.progress-card {
  background: #F8F9FA;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.progress-card.overall-progress {
  background: linear-gradient(135deg, #ED1B2F 0%, #B01B2E 100%);
  color: white;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.progress-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.progress-card h5 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  color: #333;
}

.progress-subtitle,
.progress-detail {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.progress-card:not(.overall-progress) .progress-detail {
  color: #666;
}

.progress-percentage {
  font-size: 1.5rem;
  font-weight: 700;
}

.progress-bar-container {
  height: 12px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  overflow: hidden;
}

.progress-card.overall-progress .progress-bar-container {
  background: rgba(255, 255, 255, 0.2);
}

.progress-bar-fill {
  height: 100%;
  border-radius: 50px;
  transition: width 0.5s ease;
}

.progress-bar-fill.overall {
  background: rgba(255, 255, 255, 0.9);
}

.progress-bar-fill.major {
  background: linear-gradient(90deg, #4CAF50 0%, #45A049 100%);
}

.progress-bar-fill.minor {
  background: linear-gradient(90deg, #2196F3 0%, #1976D2 100%);
}

.progress-group {
  margin-top: 2rem;
}

.progress-group-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.progress-name {
  font-weight: 600;
}

.progress-empty {
  text-align: center;
  padding: 3rem 2rem;
  color: #999;
}

.progress-empty .empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.progress-empty p {
  margin: 0;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .progress-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .progress-percentage {
    align-self: flex-end;
  }
}
