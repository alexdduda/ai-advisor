"""
McGill Faculty of Agricultural & Environmental Sciences – Degree Requirements Seed Data
Source: McGill eCalendar 2024-2025 & Course Catalogue 2025-2026
https://coursecatalogue.mcgill.ca/en/undergraduate/agri-env-sci/
https://www.mcgill.ca/study/2024-2025/faculties/macdonald/undergraduate/

This file covers core AES undergraduate programs:
  - Environmental Biology Major   – B.Sc.(Ag.Env.Sc.)   (42 credits)
  - Agricultural Economics Major  – B.Sc.(Ag.Env.Sc.)   (42 credits)
  - Life Sciences (Biological and Agricultural) Major – B.Sc.(Ag.Env.Sc.) (42 credits)
  - Bioresource Engineering Major – B.Eng.(Bioresource) (113 credits)
  - Environmental Biology Honours – B.Sc.(Ag.Env.Sc.)   (54 credits)

Accuracy notes:
  - All B.Sc.(Ag.Env.Sc.) programs also require the Foundation/Freshman year
    (30 credits, not counted in the major credit total).
  - B.Eng.(Bioresource) total of 113 credits includes 30 Foundation credits.
  - All program courses require a minimum grade of C (or C+ in some BREE courses).
  - Each major must be paired with at least one Specialization (18–24 credits).
"""

import logging
logger = logging.getLogger(__name__)

AES_PROGRAMS = [
  {
    "program_key": 'envbio_bsc_agenvsc',
    "name": 'Environmental Biology Major (B.Sc.(Ag.Env.Sc.)) (42 credits)',
    "program_type": 'major',
    "faculty": 'Faculty of Agricultural and Environmental Sciences',
    "total_credits": 42,
    "description": "The Environmental Biology Major focuses on the biology, diversity, and ecology of a broad range of organisms — from plants and vertebrate animals to insects, fungi, and microbes. Strong emphasis is placed on the ecosystems that species inhabit and the constraints imposed by the physical environment and environmental change. Significant field components are integrated throughout the course sets, making use of McGill's Macdonald Campus and the St. Lawrence Lowlands ecosystem. Graduates are trained as ecologists, taxonomists, field biologists, and ecosystem scientists. The major must be paired with at least one Specialization (18–24 cr); recommended pairings include Applied Ecology, Wildlife Biology, or Plant Biology.",
    "ecalendar_url": 'https://www.mcgill.ca/study/2024-2025/faculties/macdonald/undergraduate/programs/bachelor-science-agricultural-and-environmental-sciences-bscagenvsc-major-environmental-biology',
    "blocks": [
      {
        "block_key": 'envbio_bsc_agenvsc_required',
        "title": 'Required Courses (36 credits)',
        "block_type": 'required',
        "credits_needed": 36,
        "sort_order": 0,
        "courses": [
          {
            "subject": 'AEBI',
            "catalog": '210',
            "title": 'Organisms 1',
            "credits": 3.0,
            "is_required": True,
            "notes": '3 hours of lecture and 2 hours of lab, per week.',
          },
          {
            "subject": 'AEBI',
            "catalog": '211',
            "title": 'Organisms 2',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'AEBI',
            "catalog": '212',
            "title": 'Evolution and Phylogeny',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'AEHM',
            "catalog": '205',
            "title": 'Science Literacy',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Students whose first language is not English are encouraged to register for WCOM 295, ESL: Academic English Seminar, or equivalent, prior to starting their program.',
          },
          {
            "subject": 'AEMA',
            "catalog": '310',
            "title": 'Statistical Methods 1',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Two 1.5-hour lectures and one 2-hour lab. Please note that credit will be given for only one introductory statistics course. Consult your academic advisor.',
          },
          {
            "subject": 'ENVB',
            "catalog": '210',
            "title": 'The Biophysical Environment',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'ENVB',
            "catalog": '222',
            "title": 'St. Lawrence Ecosystems',
            "credits": 3.0,
            "is_required": True,
            "notes": 'This course carries an additional charge of $20.54 to cover the cost of transportation (bus rental) for local field trips. The fee is refundable only during the withdrawal with full refund period.',
          },
          {
            "subject": 'ENVB',
            "catalog": '305',
            "title": 'Population and Community Ecology',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'ENVB',
            "catalog": '410',
            "title": 'Ecosystem Ecology',
            "credits": 3.0,
            "is_required": True,
            "notes": 'This course carries an additional charge of $20.54 to cover the cost of transportation (bus rental) for local field trips. The fee is refundable only during the withdrawal with full refund period. Prerequisites: ENVB 222, AEMA 310 or permission of instructor.',
          },
          {
            "subject": 'LSCI',
            "catalog": '204',
            "title": 'Genetics',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Restriction: Not open to students who have taken BIOL 202.',
          },
          {
            "subject": 'LSCI',
            "catalog": '211',
            "title": 'Biochemistry 1',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Co-requisite: FDSC 230. Restriction: Not open to students who have taken FDSC 211.',
          },
          {
            "subject": 'LSCI',
            "catalog": '230',
            "title": 'Introductory Microbiology',
            "credits": 3.0,
            "is_required": True,
          },
        ],
      },
      {
        "block_key": 'envbio_bsc_agenvsc_complementary',
        "title": 'Complementary Courses (6 credits)',
        "block_type": 'choose_credits',
        "credits_needed": 6,
        "sort_order": 1,
        "courses": [
          {
            "subject": 'ENTO',
            "catalog": '330',
            "title": 'Insect Biology',
            "credits": 3.0,
          },
          {
            "subject": 'ENVB',
            "catalog": '301',
            "title": 'Meteorology',
            "credits": 3.0,
            "notes": 'Not scheduled for 2024-2025.',
          },
          {
            "subject": 'ENVB',
            "catalog": '313',
            "title": 'Phylogeny and Biogeography',
            "credits": 3.0,
            "notes": 'Not scheduled for 2024-2025. Prerequisite: AEBI 212.',
          },
          {
            "subject": 'ENVB',
            "catalog": '437',
            "title": 'Assessing Environmental Impact',
            "credits": 3.0,
            "notes": 'Open to U2 students and above.',
          },
          {
            "subject": 'ENVB',
            "catalog": '497',
            "title": 'Research Project 1',
            "credits": 3.0,
            "notes": 'Prerequisite(s): AEHM 205 and permission of instructor. Restriction: Open to U2 and above, and to students with a minimum CGPA of 3.0. Enrolment is limited by availability of research project supervisors and to students in the Environmental Biology Major. Students must obtain a minimum grade of B in ENVB 497 to be allowed to take ENVB 498.',
          },
          {
            "subject": 'ENVB',
            "catalog": '498',
            "title": 'Research Project 2',
            "credits": 3.0,
            "notes": 'Prerequisite(s): ENVB 497 and permission of instructor. Restriction(s): Open only to students who have earned a minimum of B in the prerequisite course(s). Enrolment is limited by availability of research project supervisors and to students in the Environmental Biology Major.',
          },
          {
            "subject": 'FAES',
            "catalog": '300',
            "title": 'Internship 2',
            "credits": 3.0,
            "notes": 'Restrictions: Students must be registered as a full-time student prior to and after enrollment in this course. Minimum CGPA of 2.7 required. Open to all students in the Faculty of Agricultural and Environmental Sciences.',
          },
          {
            "subject": 'MICR',
            "catalog": '331',
            "title": 'Microbial Ecology',
            "credits": 3.0,
            "notes": 'Prerequisite(s): LSCI 230 or AEBI 212 or ENVR 202 or permission of the instructor. Not recommended for U1 students.',
          },
          {
            "subject": 'PLNT',
            "catalog": '304',
            "title": 'Biology of Fungi',
            "credits": 3.0,
            "notes": 'Not scheduled for 2024-2025. Restriction: U2 or above, or permission of instructor.',
          },
          {
            "subject": 'PLNT',
            "catalog": '358',
            "title": 'Flowering Plant Diversity',
            "credits": 3.0,
            "notes": 'A 4-day field week is held the week preceding the start of classes. Prerequisite: AEBI 210 or ENVR 202 or permission of instructor. A $95.46 fee is charged to all students registered in this course, which has a fieldwork component prior to the beginning of classes in August.',
          },
          {
            "subject": 'PLNT',
            "catalog": '460',
            "title": 'Plant Ecology',
            "credits": 3.0,
            "notes": 'Not scheduled for 2024-2025. Prerequisite: AEMA 310 or permission of instructor. This course carries an additional charge of $170.00 to cover the cost of transportation (bus rental) for local field trips.',
          },
          {
            "subject": 'SOIL',
            "catalog": '300',
            "title": 'Geosystems',
            "credits": 3.0,
            "notes": 'Not scheduled for 2024-2025. Restrictions: Not open to students who have taken SOIL 200. Restricted to U2 students and above.',
          },
          {
            "subject": 'WILD',
            "catalog": '302',
            "title": 'Fish Ecology',
            "credits": 3.0,
            "notes": 'Prerequisite: AEBI 211 or permission of instructor. This course carries an additional charge of $41.07 to cover the cost of transportation (bus rental) for local field trips.',
          },
          {
            "subject": 'WILD',
            "catalog": '307',
            "title": 'Natural History of Vertebrates',
            "credits": 3.0,
            "notes": 'Page text truncated; prerequisite and full details not available in extracted text.',
          },
        ],
      },
    ],
  },
  {
    "program_key": 'envbio_honours_bsc_agenvsc',
    "name": 'Environmental Biology Honours (B.Sc.(Ag.Env.Sc.)) (54 credits)',
    "program_type": 'honours',
    "faculty": 'Faculty of Agricultural and Environmental Sciences',
    "total_credits": 54,
    "description": 'The Honours program in Environmental Biology adds an intensive independent research component on top of the 42-credit Major requirements. Students must have a minimum CGPA of 3.3 to enter and maintain a minimum overall CGPA of 3.3 at graduation. A willing supervisor must be secured before admission into the program. Applications are due in March or April of the U2 year. Credits from the Honours program are in addition to all Major and Specialization requirements (use your elective pool).',
    "ecalendar_url": 'https://coursecatalogue.mcgill.ca/en/undergraduate/agri-env-sci/programs/natural-resource-sciences/environmental-biology-honours-bsc-agenvsc/',
    "blocks": [
      {
        "block_key": 'envbio_honours_bsc_agenvsc_required',
        "title": 'Required Courses (36 credits)',
        "block_type": 'required',
        "credits_needed": 36,
        "sort_order": 0,
        "courses": [
          {
            "subject": 'AEBI',
            "catalog": '210',
            "title": 'Organisms 1.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'AEBI',
            "catalog": '211',
            "title": 'Organisms 2.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'AEBI',
            "catalog": '212',
            "title": 'Evolution and Phylogeny.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'AEHM',
            "catalog": '205',
            "title": 'Science Literacy.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'AEMA',
            "catalog": '310',
            "title": 'Statistical Methods 1.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'ENVB',
            "catalog": '210',
            "title": 'The Biophysical Environment.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'ENVB',
            "catalog": '222',
            "title": 'St. Lawrence Ecosystems.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'ENVB',
            "catalog": '305',
            "title": 'Population and Community Ecology.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'ENVB',
            "catalog": '410',
            "title": 'Ecosystem Ecology.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'LSCI',
            "catalog": '204',
            "title": 'Genetics.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'LSCI',
            "catalog": '211',
            "title": 'Biochemistry 1.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'LSCI',
            "catalog": '230',
            "title": 'Introductory Microbiology.',
            "credits": 3.0,
            "is_required": True,
          },
        ],
      },
      {
        "block_key": 'envbio_honours_bsc_agenvsc_complementary',
        "title": 'Complementary Courses (18 credits)',
        "block_type": 'choose_credits',
        "credits_needed": 6,
        "notes": 'Choose 6 credits from the following 18 options',
        "sort_order": 1,
        "courses": [
          {
            "subject": 'ENTO',
            "catalog": '330',
            "title": 'Insect Biology.',
            "credits": 3.0,
          },
          {
            "subject": 'ENVB',
            "catalog": '301',
            "title": 'Meteorology.',
            "credits": 3.0,
          },
          {
            "subject": 'ENVB',
            "catalog": '313',
            "title": 'Phylogeny and Biogeography.',
            "credits": 3.0,
          },
          {
            "subject": 'ENVB',
            "catalog": '437',
            "title": 'Assessing Environmental Impact.',
            "credits": 3.0,
          },
          {
            "subject": 'ENVB',
            "catalog": '497',
            "title": 'Research Project 1.',
            "credits": 3.0,
          },
          {
            "subject": 'ENVB',
            "catalog": '498',
            "title": 'Research Project 2.',
            "credits": 3.0,
          },
          {
            "subject": 'ENVB',
            "catalog": '529',
            "title": 'GIS for Natural Resource Management.',
            "credits": 3.0,
          },
          {
            "subject": 'FAES',
            "catalog": '300',
            "title": 'Internship 2.',
            "credits": 3.0,
          },
          {
            "subject": 'MICR',
            "catalog": '331',
            "title": 'Microbial Ecology.',
            "credits": 3.0,
          },
          {
            "subject": 'PLNT',
            "catalog": '304',
            "title": 'Biology of Fungi.',
            "credits": 3.0,
          },
          {
            "subject": 'PLNT',
            "catalog": '358',
            "title": 'Flowering Plant Diversity.',
            "credits": 3.0,
          },
          {
            "subject": 'PLNT',
            "catalog": '460',
            "title": 'Plant Ecology.',
            "credits": 3.0,
          },
          {
            "subject": 'SOIL',
            "catalog": '300',
            "title": 'Geosystems.',
            "credits": 3.0,
          },
          {
            "subject": 'WILD',
            "catalog": '302',
            "title": 'Fish Ecology.',
            "credits": 3.0,
          },
          {
            "subject": 'WILD',
            "catalog": '307',
            "title": 'Natural History of Vertebrates.',
            "credits": 3.0,
          },
          {
            "subject": 'WOOD',
            "catalog": '441',
            "title": 'Integrated Forest Management.',
            "credits": 3.0,
          },
        ],
      },
      {
        "block_key": 'envbio_honours_bsc_agenvsc_honours',
        "title": 'Honours Courses (12 credits)',
        "block_type": 'multi_group',
        "credits_needed": 12,
        "notes": 'Choose one of the following plans: Honours Plan A OR Honours Plan B',
        "sort_order": 2,
      },
      {
        "block_key": 'envbio_honours_bsc_agenvsc_honours_plan_a',
        "title": 'Honours Plan A',
        "block_type": 'group',
        "group_name": 'Honours Plan A',
        "notes": "12 credits of Honours research courses in the subject area of the student's Major, chosen in consultation with the Program Director of the student's Major and the professor who has agreed to supervise the research project.",
        "sort_order": 3,
        "courses": [
          {
            "subject": 'ENVB',
            "catalog": '401',
            "title": 'Honours Research Project 1.',
            "credits": 6.0,
            "is_required": True,
            "choose_from_group": 'Honours Plan A',
          },
          {
            "subject": 'ENVB',
            "catalog": '402',
            "title": 'Honours Research Project 2.',
            "credits": 6.0,
            "is_required": True,
            "choose_from_group": 'Honours Plan A',
          },
        ],
      },
      {
        "block_key": 'envbio_honours_bsc_agenvsc_honours_plan_b',
        "title": 'Honours Plan B',
        "block_type": 'group',
        "group_name": 'Honours Plan B',
        "notes": "6 credits of Honours project courses in the subject area of the student's Major as well as 6 credits in 400- or 500-level courses, normally selected from the Faculty of Agricultural and Environmental Sciences, in consultation with the Program Director of the student's Major and the professor who has agreed to supervise the project.",
        "sort_order": 4,
        "courses": [
          {
            "subject": 'ENVB',
            "catalog": '405',
            "title": 'Honours Project 1.',
            "credits": 3.0,
            "is_required": True,
            "choose_from_group": 'Honours Plan B',
          },
          {
            "subject": 'ENVB',
            "catalog": '406',
            "title": 'Honours Project 2.',
            "credits": 3.0,
            "is_required": True,
            "choose_from_group": 'Honours Plan B',
            "notes": '6 additional credits in 400- or 500-level courses normally from the Faculty of Agricultural and Environmental Sciences must be chosen in consultation with the Program Director',
          },
        ],
      },
    ],
  },
  {
    "program_key": 'agec_bsc_agenvsc',
    "name": 'Agricultural Economics Major (B.Sc.(Ag.Env.Sc.)) (42 credits)',
    "program_type": 'major',
    "faculty": 'Faculty of Agricultural and Environmental Sciences',
    "total_credits": 42,
    "description": 'The Agricultural Economics Major is designed to meet demand for sustainable development as it relates to the environment and resource use, and the economics and management of the global agriculture and food system. Training in economic theory and applied areas such as marketing, finance, farm management, public policy, ecology, natural resources, and international development. Students must choose one of two Specializations: Agribusiness or Environmental Economics (24 cr each). Students taking the Agribusiness Specialization may also take the Professional Agrology for Agribusiness Specialization (required for OAQ membership).',
    "ecalendar_url": 'https://www.mcgill.ca/study/2024-2025/faculties/macdonald/undergraduate/programs/bachelor-science-agricultural-and-environmental-sciences-bscagenvsc-major-agricultural-economics',
    "blocks": [
      {
        "block_key": 'agec_bsc_agenvsc_required',
        "title": 'Required Courses (36 credits)',
        "block_type": 'required',
        "credits_needed": 36,
        "sort_order": 0,
        "courses": [
          {
            "subject": 'AGEC',
            "catalog": '200',
            "title": 'Principles of Microeconomics',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'AGEC',
            "catalog": '201',
            "title": 'Principles of Macroeconomics',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Prerequisite: AGEC 200 or equivalent',
          },
          {
            "subject": 'AGEC',
            "catalog": '231',
            "title": 'Economic Systems of Agriculture',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Prerequisite: AGEC 200 or equivalent',
          },
          {
            "subject": 'AGEC',
            "catalog": '320',
            "title": 'Intermediate Microeconomic Theory',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Prerequisite: AGEC 200 or equivalent',
          },
          {
            "subject": 'AGEC',
            "catalog": '330',
            "title": 'Agriculture and Food Markets',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Prerequisite: AGEC 200 or equivalent',
          },
          {
            "subject": 'AGEC',
            "catalog": '332',
            "title": 'Farm Management and Finance',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Prerequisite: AGEC 200 or equivalent',
          },
          {
            "subject": 'AGEC',
            "catalog": '333',
            "title": 'Resource Economics',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Prerequisite: AGEC 200 or equivalent',
          },
          {
            "subject": 'AGEC',
            "catalog": '425',
            "title": 'Applied Econometrics',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Prerequisites: AEMA 310, AGEC 200 and AGEC 201 or equivalents',
          },
          {
            "subject": 'AGEC',
            "catalog": '430',
            "title": 'Agriculture, Food and Resource Policy',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Prerequisite: AGEC 200 or equivalent',
          },
          {
            "subject": 'AGEC',
            "catalog": '442',
            "title": 'Economics of International Agricultural Development',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Prerequisite: AGEC 200 or AGEC 201 or equivalent',
          },
          {
            "subject": 'ENVB',
            "catalog": '210',
            "title": 'The Biophysical Environment',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'MGCR',
            "catalog": '211',
            "title": 'Introduction to Financial Accounting',
            "credits": 3.0,
            "is_required": True,
          },
        ],
      },
      {
        "block_key": 'agec_bsc_agenvsc_complementary',
        "title": 'Complementary Courses (6 credits)',
        "block_type": 'choose_credits',
        "credits_needed": 6,
        "notes": 'With the approval of the Academic Adviser, choose one introductory course in each of the following areas: Statistics and Written/Oral Communication',
        "sort_order": 1,
        "courses": [
          {
            "title": 'Introductory Statistics Course',
            "credits": 3.0,
            "choose_from_group": 'Statistics',
            "notes": 'Any introductory statistics course; requires Academic Adviser approval',
          },
          {
            "title": 'Written/Oral Communication Course',
            "credits": 3.0,
            "choose_from_group": 'Written/Oral Communication',
            "notes": 'Any introductory written or oral communication course; requires Academic Adviser approval',
          },
        ],
      },
      {
        "block_key": 'agec_bsc_agenvsc_specialization',
        "title": 'Specialization (24 credits)',
        "block_type": 'choose_courses',
        "courses_needed": 1,
        "notes": 'Students taking the Major in Agricultural Economics must take one of the following specializations: Agribusiness (24 credits) or Environmental Economics (24 credits). Students who take the Specialization in Agribusiness can also take the Specialization in Professional Agrology for Agribusiness (24 credits). Membership to the OAQ requires successful completion of both the Agribusiness and Professional Agrology for Agribusiness specializations.',
        "sort_order": 2,
        "courses": [
          {
            "title": 'Agribusiness Specialization',
            "credits": 24.0,
            "choose_from_group": 'Specialization',
            "notes": '24 credits; see Specializations section for course list',
          },
          {
            "title": 'Environmental Economics Specialization',
            "credits": 24.0,
            "choose_from_group": 'Specialization',
            "notes": '24 credits; see Specializations section for course list',
          },
        ],
      },
    ],
  },
  {
    "program_key": 'lifesci_bsc_agenvsc',
    "name": 'Life Sciences (Biological and Agricultural) Major (B.Sc.(Ag.Env.Sc.)) (42 credits)',
    "program_type": 'major',
    "faculty": 'Faculty of Agricultural and Environmental Sciences',
    "total_credits": 42,
    "description": 'The Life Sciences (Biological and Agricultural) Major provides a strong foundation in the basic biological sciences. It will prepare graduates for careers in the agricultural, environmental, health, and biotechnological fields. Graduates with high academic achievement may go on to postgraduate studies in research, or professional programs in the biological, veterinary, medical, and health sciences fields.',
    "ecalendar_url": 'https://coursecatalogue.mcgill.ca/en/undergraduate/agri-env-sci/programs/natural-resource-sciences/life-sciences-biological-agricultural-major-bsc-agenvsc/',
    "blocks": [
      {
        "block_key": 'lifesci_bsc_agenvsc_required',
        "title": 'Required Courses (33 credits)',
        "block_type": 'required',
        "credits_needed": 33,
        "sort_order": 0,
        "courses": [
          {
            "subject": 'AEBI',
            "catalog": '210',
            "title": 'Organisms 1.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'AEBI',
            "catalog": '211',
            "title": 'Organisms 2.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'AEBI',
            "catalog": '212',
            "title": 'Evolution and Phylogeny.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'AEMA',
            "catalog": '310',
            "title": 'Statistical Methods 1.',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Other appropriate Statistics courses may be approved as substitutes by the Program Director.',
          },
          {
            "subject": 'AGEC',
            "catalog": '200',
            "title": 'Principles of Microeconomics.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'ANSC',
            "catalog": '400',
            "title": 'Eukaryotic Cells and Viruses.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'LSCI',
            "catalog": '202',
            "title": 'Molecular Cell Biology.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'LSCI',
            "catalog": '204',
            "title": 'Genetics.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'LSCI',
            "catalog": '211',
            "title": 'Biochemistry 1.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'LSCI',
            "catalog": '230',
            "title": 'Introductory Microbiology.',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'PARA',
            "catalog": '438',
            "title": 'Immunology.',
            "credits": 3.0,
            "is_required": True,
          },
        ],
      },
      {
        "block_key": 'lifesci_bsc_agenvsc_complementary',
        "title": 'Complementary Courses (9 credits)',
        "block_type": 'choose_credits',
        "credits_needed": 9,
        "sort_order": 1,
        "courses": [
          {
            "subject": 'ANSC',
            "catalog": '234',
            "title": 'Biochemistry 2.',
            "credits": 3.0,
          },
          {
            "subject": 'ANSC',
            "catalog": '250',
            "title": 'Introduction to Livestock Management',
            "credits": 3.0,
          },
          {
            "subject": 'ANSC',
            "catalog": '312',
            "title": 'Animal Health and Disease.',
            "credits": 3.0,
          },
          {
            "subject": 'ANSC',
            "catalog": '323',
            "title": 'Mammalian Physiology.',
            "credits": 3.0,
          },
          {
            "subject": 'ANSC',
            "catalog": '324',
            "title": 'Developmental Biology and Reproduction.',
            "credits": 3.0,
          },
          {
            "subject": 'ANSC',
            "catalog": '326',
            "title": 'Fundamentals of Population Genetics.',
            "credits": 3.0,
            "notes": 'This course is not currently offered.',
          },
          {
            "subject": 'ANSC',
            "catalog": '420',
            "title": 'Animal Biotechnology.',
            "credits": 3.0,
          },
          {
            "subject": 'BINF',
            "catalog": '511',
            "title": 'Bioinformatics for Genomics.',
            "credits": 3.0,
          },
          {
            "subject": 'BTEC',
            "catalog": '306',
            "title": 'Experiments in Biotechnology.',
            "credits": 3.0,
          },
          {
            "subject": 'ENVB',
            "catalog": '210',
            "title": 'The Biophysical Environment.',
            "credits": 3.0,
          },
          {
            "subject": 'ENVB',
            "catalog": '222',
            "title": 'St. Lawrence Ecosystems.',
            "credits": 3.0,
          },
          {
            "subject": 'FAES',
            "catalog": '300',
            "title": 'Internship 2.',
            "credits": 3.0,
          },
          {
            "subject": 'LSCI',
            "catalog": '451',
            "title": 'Research Project 1.',
            "credits": 3.0,
          },
          {
            "subject": 'LSCI',
            "catalog": '452',
            "title": 'Research Project 2.',
            "credits": 3.0,
          },
          {
            "subject": 'MICR',
            "catalog": '331',
            "title": 'Microbial Ecology.',
            "credits": 3.0,
          },
          {
            "subject": 'MICR',
            "catalog": '338',
            "title": 'Bacterial Molecular Genetics.',
            "credits": 3.0,
          },
          {
            "subject": 'MICR',
            "catalog": '341',
            "title": 'Mechanisms of Pathogenicity.',
            "credits": 3.0,
            "notes": 'This course is not currently offered.',
          },
          {
            "subject": 'MICR',
            "catalog": '450',
            "title": 'Environmental Microbiology.',
            "credits": 3.0,
          },
          {
            "subject": 'NRSC',
            "catalog": '333',
            "title": 'Pollution and Bioremediation.',
            "credits": 3.0,
          },
          {
            "subject": 'PARA',
            "catalog": '410',
            "title": 'Environment and Infection.',
            "credits": 3.0,
          },
          {
            "subject": 'PARA',
            "catalog": '424',
            "title": 'Fundamental Parasitology.',
            "credits": 3.0,
          },
          {
            "subject": 'PLNT',
            "catalog": '304',
            "title": 'Biology of Fungi.',
            "credits": 3.0,
          },
          {
            "subject": 'PLNT',
            "catalog": '353',
            "title": 'Plant Structure and Function.',
            "credits": 3.0,
          },
          {
            "subject": 'PLNT',
            "catalog": '426',
            "title": 'Plant Ecophysiology.',
            "credits": 3.0,
          },
          {
            "subject": 'PLNT',
            "catalog": '435',
            "title": 'Plant Breeding.',
            "credits": 3.0,
          },
        ],
      },
    ],
  },
  {
    "program_key": 'bree_beng',
    "name": 'Bioresource Engineering Major (B.Eng.(Bioresource)) (113 credits)',
    "program_type": 'beng',
    "faculty": 'Faculty of Agricultural and Environmental Sciences',
    "total_credits": 113,
    "description": 'The Bioresource Engineering Major focuses on biological, agricultural, food, and environmental areas, applying professional engineering skills to biological systems. Covers the design and implementation of technology for bio-based products including food, fibre, fuel, and biomaterials, while sustaining a healthful environment. Graduates are eligible for registration as professional engineers in any Canadian province. All BREE program courses require a minimum grade of C.',
    "ecalendar_url": 'https://www.mcgill.ca/study/2024-2025/faculties/macdonald/undergraduate/programs/bachelor-engineering-bioresource-bengbioresource-major-bioresource-engineering',
    "blocks": [
      {
        "block_key": 'bree_beng_required',
        "title": 'Required Courses (62 credits)',
        "block_type": 'required',
        "credits_needed": 62,
        "notes": 'All BREE program courses require a minimum grade of C. A B+ must be obtained in BREE 252 to be permitted to register in BREE 504.',
        "sort_order": 0,
        "courses": [
          {
            "subject": 'AEMA',
            "catalog": '202',
            "title": 'Intermediate Calculus',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'AEMA',
            "catalog": '305',
            "title": 'Differential Equations',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '205',
            "title": 'Engineering Design 1',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '210',
            "title": 'Mechanical Analysis and Design',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '216',
            "title": 'Bioresource Engineering Materials',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '252',
            "title": 'Computing for Engineers',
            "credits": 3.0,
            "is_required": True,
            "notes": 'A B+ must be obtained in this course to be permitted to register in BREE 504.',
          },
          {
            "subject": 'BREE',
            "catalog": '301',
            "title": 'Biothermodynamics',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '305',
            "title": 'Fluid Mechanics',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Carries an additional course charge for field trips ($33.36 for transportation).',
          },
          {
            "subject": 'BREE',
            "catalog": '312',
            "title": 'Electric Circuits and Machines',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '319',
            "title": 'Engineering Mathematics',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '327',
            "title": 'Bio-Environmental Engineering',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Open to U2 students and above. Carries an additional course charge for field trips ($12.32).',
          },
          {
            "subject": 'BREE',
            "catalog": '341',
            "title": 'Mechanics of Materials',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '415',
            "title": 'Design of Machines and Structural Elements',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Not open to students who have taken BREE 315. Course fee of $20.60 for 3D printing supplies.',
          },
          {
            "subject": 'BREE',
            "catalog": '420',
            "title": 'Engineering for Sustainability',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '451',
            "title": 'Undergraduate Seminar 1 - Oral Presentation',
            "credits": 1.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '452',
            "title": 'Undergraduate Seminar 2 Poster Presentation',
            "credits": 1.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '453',
            "title": 'Undergraduate Seminar 3 - Scientific Writing',
            "credits": 1.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '485',
            "title": 'Senior Undergraduate Seminar',
            "credits": 1.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '490',
            "title": 'Engineering Design 2',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '495',
            "title": 'Engineering Design 3',
            "credits": 3.0,
            "is_required": True,
          },
          {
            "subject": 'BREE',
            "catalog": '504',
            "title": 'Instrumentation and Control',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Requires a B+ in BREE 252 to register.',
          },
          {
            "subject": 'FACC',
            "catalog": '250',
            "title": 'Responsibilities of the Professional Engineer',
            "credits": 0.0,
            "is_required": True,
            "notes": 'Listed as 0-0-0.5 contact hours; no credits listed in catalogue entry.',
          },
          {
            "subject": 'FACC',
            "catalog": '300',
            "title": 'Engineering Economy',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Not open to students who have taken MIME 310.',
          },
          {
            "subject": 'FACC',
            "catalog": '400',
            "title": 'Engineering Professional Practice',
            "credits": 1.0,
            "is_required": True,
            "notes": 'Not open to students who have taken MIME 221. Requires at least 45 program credits for B.Eng.(Bioresource) students.',
          },
          {
            "subject": 'MECH',
            "catalog": '289',
            "title": 'Design Graphics',
            "credits": 3.0,
            "is_required": True,
            "notes": 'Not open to students in Mechanical Engineering.',
          },
        ],
      },
      {
        "block_key": 'bree_beng_complementary_set_a',
        "title": 'Complementary Courses - Set A (3 credits)',
        "block_type": 'choose_credits',
        "group_name": 'Set A',
        "credits_needed": 3,
        "notes": 'Page was truncated after CIVE 302; additional courses in Set A and subsequent complementary course sets (Sets B, C, etc.) could not be captured. Advisor must verify the full list from the live catalogue.',
        "sort_order": 1,
        "courses": [
          {
            "subject": 'AEMA',
            "catalog": '310',
            "title": 'Statistical Methods 1',
            "credits": 3.0,
            "choose_from_group": 'Set A',
            "notes": 'Credit will be given for only one introductory statistics course.',
          },
          {
            "subject": 'CIVE',
            "catalog": '302',
            "title": 'Probabilistic Systems',
            "credits": 3.0,
            "choose_from_group": 'Set A',
            "notes": 'Page truncated after this course; list may be incomplete.',
          },
        ],
      },
    ],
  },
]


# ═══════════════════════════════════════════════════════════════════════════════
#  Seed helper – same upsert pattern as all other seed files
# ═══════════════════════════════════════════════════════════════════════════════

def _upsert_program(supabase, prog: dict) -> dict:
    """Insert or update one program record, returning its DB id."""
    key = prog["program_key"]

    existing = (
        supabase.table("degree_programs")
        .select("id")
        .eq("program_key", key)
        .limit(1)
        .execute()
    )

    payload = {
        "program_key":  key,
        "name":         prog["name"],
        "program_type": prog["program_type"],
        "faculty":      prog["faculty"],
        "total_credits": prog["total_credits"],
        "description":  prog.get("description", ""),
        "ecalendar_url": prog.get("ecalendar_url", ""),
    }

    if existing.data:
        prog_id = existing.data[0]["id"]
        supabase.table("degree_programs").update(payload).eq("id", prog_id).execute()
        logger.info(f"Updated program: {key}")
    else:
        result = supabase.table("degree_programs").insert(payload).execute()
        prog_id = result.data[0]["id"]
        logger.info(f"Inserted program: {key}")

    return prog_id


def _upsert_block(supabase, prog_id: str, block: dict, sort_order: int) -> str:
    """Insert or update one requirement block, returning its DB id."""
    key = block["block_key"]

    existing = (
        supabase.table("requirement_blocks")
        .select("id")
        .eq("block_key", key)
        .limit(1)
        .execute()
    )

    payload = {
        "program_id":     prog_id,
        "block_key":      key,
        "title":          block["title"],
        "block_type":     block["block_type"],
        "credits_needed": block.get("credits_needed"),
        "courses_needed": block.get("courses_needed"),
        "group_name":     block.get("group_name"),
        "notes":          block.get("notes", ""),
        "sort_order":     sort_order,
    }

    if existing.data:
        block_id = existing.data[0]["id"]
        supabase.table("requirement_blocks").update(payload).eq("id", block_id).execute()
    else:
        result = supabase.table("requirement_blocks").insert(payload).execute()
        block_id = result.data[0]["id"]

    return block_id


def _upsert_courses(supabase, block_id: str, courses: list[dict]) -> None:
    """Delete existing courses for a block and re-insert fresh."""
    supabase.table("requirement_courses").delete().eq("block_id", block_id).execute()

    for i, c in enumerate(courses):
        supabase.table("requirement_courses").insert({
            "block_id":              block_id,
            # .get, not [], to match every other faculty seeder. Some rows are
            # adviser-approved placeholders with no course code at all —
            # "Introductory Statistics Course", "Agribusiness Specialization" —
            # and a KeyError here aborts the whole block, silently leaving it
            # with zero courses.
            "subject":               c.get("subject", ""),
            "catalog":               c.get("catalog"),
            "title":                 c.get("title", ""),
            "credits":               c.get("credits", 3),
            "is_required":           c.get("is_required", False),
            "recommended":           c.get("recommended", False),
            "recommendation_reason": c.get("recommendation_reason", ""),
            "choose_from_group":     c.get("choose_from_group", None),
            "choose_n_credits":      c.get("choose_n_credits", None),
            "notes":                 c.get("notes", ""),
            "sort_order":            i,
        }).execute()


def seed_degree_requirements(supabase) -> dict:
    """Seed all AES degree programs into the database."""
    stats = {"programs": 0, "blocks": 0, "courses": 0, "errors": []}

    for prog in AES_PROGRAMS:
        try:
            prog_id = _upsert_program(supabase, prog)
            stats["programs"] += 1

            for i, block in enumerate(prog.get("blocks", [])):
                try:
                    block_id = _upsert_block(supabase, prog_id, block, i)
                    stats["blocks"] += 1

                    courses = block.get("courses", [])
                    _upsert_courses(supabase, block_id, courses)
                    stats["courses"] += len(courses)

                except Exception as e:
                    msg = f"Block error [{prog['program_key']} / {block.get('block_key')}]: {e}"
                    logger.error(msg)
                    stats["errors"].append(msg)

        except Exception as e:
            msg = f"Program error [{prog.get('program_key')}]: {e}"
            logger.error(msg)
            stats["errors"].append(msg)

    logger.info(f"AES seed complete: {stats}")
    return stats


if __name__ == "__main__":
    import os, sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
    from api.utils.supabase_client import get_supabase
    supabase = get_supabase()
    stats = seed_degree_requirements(supabase)
    print(f"Seeded: {stats['programs']} programs, {stats['blocks']} blocks, {stats['courses']} courses")
    if stats.get("errors"):
        print(f"Errors: {stats['errors']}")
