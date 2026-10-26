require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const Service = require('../models/Service');
const HelpRequest = require('../models/HelpRequest');
const Organization = require('../models/Organization');
const VolunteerOpportunity = require('../models/VolunteerOpportunity');
const VolunteerApplication = require('../models/VolunteerApplication');
const Institute = require('../models/Institute');
const Program = require('../models/Program');
const Participation = require('../models/Participation');
const Review = require('../models/Review');
const Certificate = require('../models/Certificate');
const Counter = require('../models/Counter');

const PASSWORD = 'Password@123';

const date = (str) => new Date(str);

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing existing data...');
  await mongoose.connection.dropDatabase();

  const mkUser = (name, email, role, location, extra = {}) =>
    User.create({ name, email, password: PASSWORD, role, location, ...extra });

  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@sahayseva.com',
    password: 'Admin@123',
    role: 'admin',
    location: 'Pune',
  });

  const ravi = await mkUser('Ravi Sharma', 'ravi@sahayseva.com', 'user', 'Kothrud, Pune');
  const priya = await mkUser('Priya Desai', 'priya@sahayseva.com', 'user', 'Kothrud, Pune', {
    phone: '9822011223',
  });
  const meena = await mkUser('Meena Iyer', 'meena@sahayseva.com', 'user', 'Whitefield, Bengaluru');

  const sunil = await mkUser('Sunil Kumar', 'sunil@sahayseva.com', 'provider', 'Kothrud, Pune');
  const anita = await mkUser('Anita Gupta', 'anita@sahayseva.com', 'provider', 'Karve Nagar, Pune');
  const farhan = await mkUser('Farhan Ali', 'farhan@sahayseva.com', 'provider', 'Hadapsar, Pune');
  const lakshmi = await mkUser('Lakshmi Nair', 'lakshmi@sahayseva.com', 'provider', 'Viman Nagar, Pune');

  const arjun = await mkUser('Arjun Patel', 'arjun@sahayseva.com', 'volunteer', 'Baner, Pune');
  const kavya = await mkUser('Kavya Reddy', 'kavya@sahayseva.com', 'volunteer', 'Koramangala, Bengaluru');

  const ngoSevaUser = await mkUser('Seva Foundation', 'seva@sahayseva.com', 'ngo', 'Pune');
  const ngoGreenUser = await mkUser('Green Earth Collective', 'green@sahayseva.com', 'ngo', 'Bengaluru');
  const ngoHopeUser = await mkUser('Hope Literacy Mission', 'hope@sahayseva.com', 'ngo', 'Pune');
  const collegeUser = await mkUser('Nagarjuna Institute of Technology', 'college@sahayseva.com', 'college', 'Pune');

  const providerProfiles = {};
  const mkProvider = async (user, data) => {
    providerProfiles[user.name] = await ServiceProvider.create({ user: user._id, ...data });
  };

  await mkProvider(sunil, {
    description: 'Experienced Maths and Science tutor for school students. 8 years of home tuition experience.',
    category: 'Education',
    location: 'Kothrud, Pune',
    availability: 'Mon-Sat, 4 PM to 8 PM',
    pricingType: 'Paid',
    price: 400,
    rating: 4.8,
    numReviews: 1,
    completedServices: 12,
    verificationStatus: 'Verified',
  });
  await mkProvider(anita, {
    description: 'Certified computer and laptop repair technician. On-site service, genuine spare parts.',
    category: 'Digital Assistance',
    location: 'Karve Nagar, Pune',
    availability: 'All days, 9 AM to 7 PM',
    pricingType: 'Paid',
    price: 500,
    rating: 5,
    numReviews: 1,
    completedServices: 27,
    verificationStatus: 'Verified',
  });
  await mkProvider(farhan, {
    description: 'Electrician and plumber for household repairs, wiring, taps and fittings.',
    category: 'Household Help',
    location: 'Hadapsar, Pune',
    availability: 'Mon-Sat, 10 AM to 6 PM',
    pricingType: 'Paid',
    price: 350,
    completedServices: 19,
  });
  await mkProvider(lakshmi, {
    description: 'Retired teacher offering free digital literacy sessions for senior citizens.',
    category: 'Digital Assistance',
    location: 'Viman Nagar, Pune',
    availability: 'Weekends, 10 AM to 1 PM',
    pricingType: 'Free',
    rating: 5,
    numReviews: 1,
    completedServices: 5,
    verificationStatus: 'Verified',
  });

  const services = await Service.create([
    {
      provider: providerProfiles['Sunil Kumar']._id,
      title: 'Home Tuition - Maths & Science (Class 6-10)',
      description: 'Concept-based home tuition for CBSE and state board students. Monthly packages available.',
      category: 'Education',
      location: 'Kothrud, Pune',
      pricingType: 'Paid',
      price: 400,
      availability: 'Mon-Sat, 4 PM to 8 PM',
    },
    {
      provider: providerProfiles['Sunil Kumar']._id,
      title: 'Free Homework Help at Community Centre',
      description: 'Volunteer homework guidance for school children at Kothrud Community Centre every Sunday.',
      category: 'Education',
      location: 'Kothrud, Pune',
      pricingType: 'Free',
      availability: 'Sundays, 9 AM to 11 AM',
    },
    {
      provider: providerProfiles['Anita Gupta']._id,
      title: 'Computer Repair at Home',
      description: 'Laptop/desktop repair, OS installation, virus removal and upgrades done at your home.',
      category: 'Digital Assistance',
      location: 'Karve Nagar, Pune',
      pricingType: 'Paid',
      price: 500,
      availability: 'All days, 9 AM to 7 PM',
    },
    {
      provider: providerProfiles['Farhan Ali']._id,
      title: 'Electrical & Plumbing Repairs',
      description: 'Switchboards, fans, tube lights, leaking taps, flush tanks and drain cleaning.',
      category: 'Household Help',
      location: 'Hadapsar, Pune',
      pricingType: 'Paid',
      price: 350,
      availability: 'Mon-Sat, 10 AM to 6 PM',
    },
    {
      provider: providerProfiles['Lakshmi Nair']._id,
      title: 'Free Digital Literacy for Senior Citizens',
      description: 'Learn video calls, UPI payments, online bill payments and safe internet usage. One-on-one sessions.',
      category: 'Digital Assistance',
      location: 'Viman Nagar, Pune',
      pricingType: 'Free',
      availability: 'Weekends, 10 AM to 1 PM',
    },
  ]);

  await HelpRequest.create([
    {
      requester: ravi._id,
      title: 'Groceries and medicines for elderly neighbour',
      description:
        'My 78-year-old neighbour Mrs. Joshi lives alone. Need someone to pick up groceries from the market and collect her blood pressure medicines from the pharmacy.',
      category: 'Food Assistance',
      location: 'Kothrud, Pune',
      urgency: 'Medium',
      pricingType: 'Free',
      preferredDate: date('2026-10-08'),
      preferredTime: 'Morning',
      status: 'Pending',
    },
    {
      requester: meena._id,
      title: 'Escort needed for hospital visit',
      description:
        'Need a volunteer to accompany my father to his cardiology appointment and help with paperwork. Auto fare will be covered.',
      category: 'Healthcare Assistance',
      location: 'Whitefield, Bengaluru',
      urgency: 'Emergency',
      pricingType: 'Free',
      preferredDate: date('2026-10-07'),
      preferredTime: '10 AM',
      status: 'Pending',
    },
    {
      requester: priya._id,
      title: 'Laptop repair at home',
      description: 'Laptop is very slow and overheating. Looking for a technician who can visit home.',
      category: 'Digital Assistance',
      location: 'Kothrud, Pune',
      urgency: 'High',
      pricingType: 'Paid',
      budget: 500,
      preferredDate: date('2026-09-28'),
      preferredTime: 'Any time',
      assignedProvider: anita._id,
      status: 'Completed',
      acceptedAt: date('2026-09-27T10:00:00Z'),
      completedAt: date('2026-09-28T15:30:00Z'),
    },
    {
      requester: ravi._id,
      title: 'Set up video calling for grandparents',
      description: 'Grandparents moved to Pune. Need help setting up WhatsApp video calls on their phone.',
      category: 'Digital Assistance',
      location: 'Kothrud, Pune',
      urgency: 'Low',
      pricingType: 'Free',
      preferredDate: date('2026-09-20'),
      preferredTime: 'Evening',
      assignedProvider: lakshmi._id,
      status: 'Completed',
      acceptedAt: date('2026-09-19T09:00:00Z'),
      completedAt: date('2026-09-20T12:00:00Z'),
    },
    {
      requester: priya._id,
      title: 'Weekend tutor for Class 7 Maths',
      description: 'Looking for a patient tutor for my son, Class 7 Maths, weekends preferred.',
      category: 'Education',
      location: 'Kothrud, Pune',
      urgency: 'Medium',
      pricingType: 'Paid',
      budget: 300,
      preferredDate: date('2026-10-10'),
      preferredTime: '5 PM',
      assignedProvider: sunil._id,
      status: 'Accepted',
      acceptedAt: date('2026-10-03T11:00:00Z'),
    },
  ]);

  await Review.create([
    {
      reviewer: priya._id,
      target: anita._id,
      rating: 5,
      comment:
        'Anita diagnosed the overheating issue in minutes and fixed it the same day. Very professional and reasonably priced.',
    },
    {
      reviewer: ravi._id,
      target: lakshmi._id,
      rating: 5,
      comment:
        'Lakshmi ma\'am was extremely patient with my grandparents. They can now video call us every evening!',
    },
  ]);

  const orgSeva = await Organization.create({
    name: 'Seva Foundation',
    description:
      'Community organization working on food security, elderly support and local volunteering drives across Pune.',
    causes: ['Food Assistance', 'Elderly Assistance', 'Community Events'],
    location: 'Pune',
    contact: { email: 'seva@sahayseva.com', phone: '9822000001' },
    verificationStatus: 'Verified',
    organizationType: 'SahaySeva Organization',
    owner: ngoSevaUser._id,
  });
  const orgGreen = await Organization.create({
    name: 'Green Earth Collective',
    description:
      'Youth-led environmental group organizing plantation drives, lake cleanups and waste segregation awareness in Bengaluru.',
    causes: ['Environment', 'Community Events'],
    location: 'Bengaluru',
    contact: { email: 'green@sahayseva.com', phone: '9845000002' },
    verificationStatus: 'Verified',
    organizationType: 'SahaySeva Organization',
    owner: ngoGreenUser._id,
  });
  const orgHope = await Organization.create({
    name: 'Hope Literacy Mission',
    description:
      'Runs weekend learning centres for underprivileged children in Pune. Seeking volunteers for teaching and content creation.',
    causes: ['Education'],
    location: 'Pune',
    contact: { email: 'hope@sahayseva.com', phone: '9822000003' },
    verificationStatus: 'Pending Verification',
    organizationType: 'SahaySeva Organization',
    owner: ngoHopeUser._id,
  });

  await Organization.create([
    {
      name: 'Goonj',
      description:
        'Urban clothing and material collection turned into disaster relief and rural development resources. (Public information listed for reference.)',
      causes: ['Emergency Support', 'Community Events'],
      location: 'New Delhi',
      officialWebsite: 'https://goonj.org',
      organizationType: 'External Organization',
    },
    {
      name: 'HelpAge India',
      description:
        'National NGO working for the care and welfare of disadvantaged elderly people. (Public information listed for reference.)',
      causes: ['Elderly Assistance', 'Healthcare Assistance'],
      location: 'New Delhi',
      officialWebsite: 'https://www.helpageindia.org',
      organizationType: 'External Organization',
    },
    {
      name: 'The Akshaya Patra Foundation',
      description:
        'Runs one of the largest school meal programs in India. (Public information listed for reference.)',
      causes: ['Food Assistance', 'Education'],
      location: 'Bengaluru',
      officialWebsite: 'https://www.akshayapatra.org',
      organizationType: 'External Organization',
    },
    {
      name: 'Teach For India',
      description:
        'Fellowship program placing teaching volunteers in under-resourced schools. (Public information listed for reference.)',
      causes: ['Education'],
      location: 'Mumbai',
      officialWebsite: 'https://www.teachforindia.org',
      organizationType: 'External Organization',
    },
    {
      name: 'Demo: CareForAll Trust',
      description:
        'FICTIONAL organization created for this college prototype. Demonstrates an external resource card in the directory.',
      causes: ['Healthcare Assistance', 'Elderly Assistance'],
      location: 'Mumbai',
      officialWebsite: 'https://example.com/careforall',
      organizationType: 'Demo Organization',
    },
    {
      name: 'Demo: YouthServe Network',
      description:
        'FICTIONAL organization created for this college prototype. Demonstrates a youth volunteering external resource.',
      causes: ['Education', 'Community Events'],
      location: 'Delhi',
      officialWebsite: 'https://example.com/youthserve',
      organizationType: 'Demo Organization',
    },
  ]);

  const oppFood = await VolunteerOpportunity.create({
    organization: orgSeva._id,
    title: 'Weekend Food Distribution Drive',
    description:
      'Pack and distribute meal packets to families in need at Yerawada. Report at the community kitchen by 9 AM.',
    category: 'Food Assistance',
    location: 'Yerawada, Pune',
    date: date('2026-10-11'),
    startTime: '09:00',
    endTime: '13:00',
    serviceHours: 4,
    requiredVolunteers: 15,
    certificateEligible: true,
    requirements: 'Wear comfortable clothes. Meal packets and gloves are provided at the venue.',
    status: 'Open',
  });
  await VolunteerOpportunity.create({
    organization: orgSeva._id,
    title: 'Digital Literacy Camp for Senior Citizens',
    description:
      'Teach senior citizens how to use smartphones, UPI and video calls. Materials and refreshments provided.',
    category: 'Digital Assistance',
    location: 'Kothrud, Pune',
    date: date('2026-10-18'),
    startTime: '10:00',
    endTime: '14:00',
    serviceHours: 4,
    requiredVolunteers: 8,
    certificateEligible: true,
    status: 'Open',
  });
  const oppMonsoon = await VolunteerOpportunity.create({
    organization: orgSeva._id,
    title: 'Monsoon Donation Drive',
    description:
      'Collect, sort and pack clothes and blankets for flood-affected families. This drive is completed.',
    category: 'Community Events',
    location: 'Shivaji Nagar, Pune',
    date: date('2026-09-20'),
    startTime: '09:00',
    endTime: '13:00',
    serviceHours: 4,
    requiredVolunteers: 10,
    status: 'Completed',
  });
  const oppTree = await VolunteerOpportunity.create({
    organization: orgGreen._id,
    title: 'Tree Plantation Drive',
    description:
      'Plant 200 saplings along the Sarjapur road green belt. Tools, gloves and saplings provided.',
    category: 'Environment',
    location: 'Sarjapur Road, Bengaluru',
    date: date('2026-10-12'),
    startTime: '09:30',
    endTime: '13:30',
    serviceHours: 4,
    requiredVolunteers: 20,
    certificateEligible: true,
    requirements: 'Saplings, tools and gloves provided. Bring a water bottle and cap.',
    status: 'Open',
  });
  await VolunteerOpportunity.create({
    organization: orgGreen._id,
    title: 'Lake Cleanliness Drive',
    description: 'Help clean the lake perimeter, segregate waste and spread awareness among visitors.',
    category: 'Environment',
    location: 'Ulsoor Lake, Bengaluru',
    date: date('2026-10-25'),
    startTime: '08:00',
    endTime: '11:00',
    serviceHours: 3,
    requiredVolunteers: 25,
    certificateEligible: false,
    status: 'Open',
  });
  await VolunteerOpportunity.create({
    organization: orgHope._id,
    title: 'Weekend Teaching for Children',
    description:
      'Teach basic English and Maths to children at our learning centre. Lesson plans will be shared in advance.',
    category: 'Education',
    location: 'Katraj, Pune',
    date: date('2026-10-10'),
    startTime: '10:00',
    endTime: '13:00',
    serviceHours: 3,
    requiredVolunteers: 10,
    certificateEligible: true,
    requirements: 'Basic English needed. Lesson plans are shared in advance.',
    status: 'Open',
  });

  await VolunteerApplication.create([
    { opportunity: oppFood._id, volunteer: kavya._id, status: 'Accepted', appliedAt: date('2026-10-02') },
    { opportunity: oppTree._id, volunteer: arjun._id, status: 'Applied', appliedAt: date('2026-10-03') },
    { opportunity: oppMonsoon._id, volunteer: kavya._id, status: 'Completed', appliedAt: date('2026-09-15') },
    { opportunity: oppMonsoon._id, volunteer: arjun._id, status: 'Completed', appliedAt: date('2026-09-14') },
  ]);

  await Participation.create([
    {
      participant: kavya._id,
      organization: orgSeva._id,
      opportunity: oppMonsoon._id,
      serviceHours: 4,
      completionStatus: 'Completed',
      verificationStatus: 'Verified',
      completionDate: date('2026-09-20'),
    },
    {
      participant: arjun._id,
      organization: orgSeva._id,
      opportunity: oppMonsoon._id,
      serviceHours: 4,
      completionStatus: 'Completed',
      verificationStatus: 'Verified',
      completionDate: date('2026-09-20'),
    },
  ]);

  const institute = await Institute.create({
    name: 'Nagarjuna Institute of Technology',
    description:
      'Demo institute profile for this college prototype. Runs structured community-service programs for its students.',
    location: 'Pune',
    contact: { email: 'college@sahayseva.com', phone: '9822011222' },
    verificationStatus: 'Verified',
    owner: collegeUser._id,
  });

  const sneha = await mkUser('Sneha Joshi', 'sneha@sahayseva.com', 'volunteer', 'Pune', {
    password: 'Student@123',
    affiliatedInstitute: institute._id,
    phone: '9822044556',
  });
  const amit = await mkUser('Amit Bhosale', 'amit@sahayseva.com', 'volunteer', 'Pune', {
    password: 'Student@123',
    affiliatedInstitute: institute._id,
  });
  const tara = await mkUser('Tara Menon', 'tara@sahayseva.com', 'volunteer', 'Pune', {
    password: 'Student@123',
    affiliatedInstitute: institute._id,
  });
  await mkUser('Rohit Kadam', 'rohit@sahayseva.com', 'volunteer', 'Pune', {
    password: 'Student@123',
    affiliatedInstitute: institute._id,
  });

  const progTeaching = await Program.create({
    institute: institute._id,
    title: 'Community Teaching Drive',
    description:
      'Teach underprivileged children at adopted municipal schools. Aligned with the institute social outreach credit.',
    category: 'Education',
    location: 'Municipal School, Katraj, Pune',
    date: date('2026-10-10'),
    startTime: '09:00',
    endTime: '13:00',
    serviceHours: 4,
    requiredStudents: 20,
    status: 'Open',
  });
  await Program.create({
    institute: institute._id,
    title: 'Blood Donation Awareness Camp',
    description:
      'Awareness walks and donor registration support with the city blood bank. Volunteers get a participation record.',
    category: 'Healthcare Assistance',
    location: 'Institute Campus, Pune',
    date: date('2026-10-24'),
    startTime: '09:30',
    endTime: '12:30',
    serviceHours: 3,
    requiredStudents: 30,
    status: 'Open',
  });
  const progCleanliness = await Program.create({
    institute: institute._id,
    title: 'Neighbourhood Cleanliness Drive',
    description: 'Completed program: cleanliness and waste segregation drive in wards near the campus.',
    category: 'Environment',
    location: 'Ward 12 & 14, Pune',
    date: date('2026-09-05'),
    startTime: '08:00',
    endTime: '12:00',
    serviceHours: 4,
    requiredStudents: 15,
    status: 'Completed',
  });

  const partSneha = await Participation.create({
    participant: sneha._id,
    institute: institute._id,
    program: progCleanliness._id,
    serviceHours: 4,
    completionStatus: 'Completed',
    verificationStatus: 'Verified',
    completionDate: date('2026-09-05'),
  });
  await Participation.create({
    participant: amit._id,
    institute: institute._id,
    program: progTeaching._id,
    serviceHours: 4,
    completionStatus: 'Enrolled',
    verificationStatus: 'Pending',
  });
  await Participation.create({
    participant: tara._id,
    institute: institute._id,
    program: progTeaching._id,
    serviceHours: 4,
    completionStatus: 'Enrolled',
    verificationStatus: 'Pending',
  });

  const mkCertificate = async (seq, recipient, organizationName, issuer, issuerType, issuedBy, activityName, hours, completionDate, sourceModel, sourceId) => {
    await Certificate.create({
      certificateId: `SS-2026-${String(seq).padStart(4, '0')}`,
      recipientName: recipient.name,
      recipient: recipient._id,
      organizationName,
      activityName,
      serviceHours: hours,
      completionDate,
      issuer,
      issuerType,
      issuedByOrganization: issuerType === 'Organization' ? issuedBy : null,
      issuedByInstitute: issuerType === 'Institute' ? issuedBy : null,
      sourceModel,
      sourceId,
      verificationStatus: 'Valid',
      verificationData: {
        verifiedUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-certificate`,
        certificateId: `SS-2026-${String(seq).padStart(4, '0')}`,
        issuedAt: completionDate,
      },
    });
  };

  await mkCertificate(1, arjun, orgSeva.name, orgSeva.name, 'Organization', orgSeva._id, 'Monsoon Donation Drive', 4, date('2026-09-20'), 'Participation', null);
  await mkCertificate(2, kavya, orgSeva.name, orgSeva.name, 'Organization', orgSeva._id, 'Monsoon Donation Drive', 4, date('2026-09-20'), 'Participation', null);
  await mkCertificate(3, sneha, institute.name, institute.name, 'Institute', institute._id, 'Neighbourhood Cleanliness Drive', 4, date('2026-09-05'), 'Participation', partSneha._id);
  await Counter.findByIdAndUpdate('certificate-2026', { seq: 3 }, { upsert: true });

  console.log('\n================ DEMO DATA SEEDED ================');
  console.log('Login credentials (all demo accounts):');
  console.log('  Admin:        admin@sahayseva.com   / Admin@123');
  console.log('  Community:    ravi@sahayseva.com    / Password@123');
  console.log('  Community:    priya@sahayseva.com   / Password@123');
  console.log('  Provider:     anita@sahayseva.com   / Password@123');
  console.log('  Volunteer:    arjun@sahayseva.com   / Password@123');
  console.log('  NGO:          seva@sahayseva.com    / Password@123');
  console.log('  College:      college@sahayseva.com / Password@123');
  console.log('  Student:      sneha@sahayseva.com   / Student@123');
  console.log('===================================================\n');
  await mongoose.connection.close();
};

const destroy = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.dropDatabase();
  console.log('Database cleared.');
  await mongoose.connection.close();
};

if (process.argv.includes('--destroy')) {
  destroy().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  seed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
