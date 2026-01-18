/**
 * Base de mots-clés généraliste pour l'extraction automatique
 * Couvre tous les secteurs d'activité, pas uniquement la tech
 */

// ═══════════════════════════════════════════════════════════════
// TECHNOLOGIE & INFORMATIQUE
// ═══════════════════════════════════════════════════════════════

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go', 'Golang', 'Rust',
  'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'Perl', 'R', 'MATLAB', 'Julia', 'Lua',
  'Haskell', 'Erlang', 'Elixir', 'Clojure', 'F#', 'Dart', 'Objective-C', 'Assembly',
  'COBOL', 'Fortran', 'Pascal', 'Delphi', 'VBA', 'VB.NET', 'Groovy', 'Shell', 'Bash',
  'PowerShell', 'SQL', 'PL/SQL', 'T-SQL', 'NoSQL', 'GraphQL', 'HTML', 'CSS', 'SASS',
  'SCSS', 'LESS', 'XML', 'JSON', 'YAML', 'Markdown', 'LaTeX', 'Solidity', 'VHDL', 'Verilog',
];

const FRAMEWORKS_FRONTEND = [
  'React', 'React.js', 'ReactJS', 'Vue', 'Vue.js', 'VueJS', 'Angular', 'AngularJS',
  'Svelte', 'SvelteKit', 'Next.js', 'NextJS', 'Nuxt', 'Nuxt.js', 'Remix', 'Gatsby',
  'Astro', 'Ember', 'Backbone', 'jQuery', 'Alpine.js', 'Lit', 'Preact', 'Solid',
  'Qwik', 'Stimulus', 'Hotwire', 'Turbo', 'HTMX', 'Bootstrap', 'Tailwind', 'TailwindCSS',
  'Material UI', 'MUI', 'Chakra UI', 'Ant Design', 'Vuetify', 'Bulma', 'Foundation',
  'Semantic UI', 'PrimeReact', 'Radix', 'Headless UI', 'Shadcn', 'DaisyUI',
];

const FRAMEWORKS_BACKEND = [
  'Node.js', 'NodeJS', 'Express', 'Express.js', 'NestJS', 'Fastify', 'Koa', 'Hapi',
  'Django', 'Flask', 'FastAPI', 'Pyramid', 'Tornado', 'Sanic', 'Starlette',
  'Spring', 'Spring Boot', 'Hibernate', 'Quarkus', 'Micronaut', 'Vert.x',
  'Laravel', 'Symfony', 'CodeIgniter', 'CakePHP', 'Yii', 'Zend', 'Slim',
  'Ruby on Rails', 'Rails', 'Sinatra', 'Hanami',
  'ASP.NET', '.NET Core', '.NET', 'Entity Framework', 'Blazor',
  'Gin', 'Echo', 'Fiber', 'Chi', 'Buffalo',
  'Phoenix', 'Plug', 'Actix', 'Rocket', 'Axum', 'Warp',
];

const FRAMEWORKS_MOBILE = [
  'React Native', 'Flutter', 'Ionic', 'Xamarin', 'MAUI', 'Cordova', 'PhoneGap',
  'NativeScript', 'Capacitor', 'Expo', 'SwiftUI', 'UIKit', 'Jetpack Compose',
  'Android SDK', 'iOS SDK', 'Kotlin Multiplatform', 'KMM',
];

const CLOUD_DEVOPS = [
  'AWS', 'Amazon Web Services', 'Azure', 'Microsoft Azure', 'GCP', 'Google Cloud',
  'Google Cloud Platform', 'DigitalOcean', 'Heroku', 'Vercel', 'Netlify', 'Cloudflare',
  'OVH', 'Scaleway', 'Linode', 'Vultr', 'IBM Cloud', 'Oracle Cloud', 'Alibaba Cloud',
  'Docker', 'Kubernetes', 'K8s', 'OpenShift', 'Rancher', 'Helm', 'Istio', 'Linkerd',
  'Terraform', 'Pulumi', 'CloudFormation', 'Ansible', 'Chef', 'Puppet', 'SaltStack',
  'Jenkins', 'GitLab CI', 'GitHub Actions', 'CircleCI', 'Travis CI', 'TeamCity',
  'Azure DevOps', 'Bamboo', 'ArgoCD', 'Flux', 'Spinnaker', 'Tekton',
  'Prometheus', 'Grafana', 'Datadog', 'New Relic', 'Splunk', 'ELK', 'Elasticsearch',
  'Logstash', 'Kibana', 'Jaeger', 'Zipkin', 'OpenTelemetry', 'PagerDuty', 'Opsgenie',
  'Nginx', 'Apache', 'HAProxy', 'Traefik', 'Envoy', 'Kong', 'API Gateway',
  'Lambda', 'Serverless', 'Cloud Functions', 'Azure Functions', 'Fargate', 'ECS', 'EKS',
  'AKS', 'GKE', 'EC2', 'S3', 'RDS', 'DynamoDB', 'CloudFront', 'Route 53',
];

const DATABASES = [
  'PostgreSQL', 'Postgres', 'MySQL', 'MariaDB', 'SQLite', 'SQL Server', 'MSSQL',
  'Oracle', 'Oracle DB', 'DB2', 'Sybase', 'Teradata', 'Snowflake', 'BigQuery',
  'Redshift', 'Athena', 'Presto', 'Trino', 'Clickhouse', 'TimescaleDB',
  'MongoDB', 'Mongoose', 'CouchDB', 'Couchbase', 'RavenDB', 'ArangoDB',
  'Cassandra', 'ScyllaDB', 'HBase', 'DynamoDB', 'CosmosDB', 'Firebase', 'Firestore',
  'Redis', 'Memcached', 'Valkey', 'KeyDB', 'Hazelcast',
  'Elasticsearch', 'OpenSearch', 'Solr', 'Algolia', 'Meilisearch', 'Typesense',
  'Neo4j', 'ArangoDB', 'Neptune', 'JanusGraph', 'TigerGraph', 'Dgraph',
  'InfluxDB', 'Prometheus', 'TimescaleDB', 'QuestDB', 'VictoriaMetrics',
  'Supabase', 'PlanetScale', 'Neon', 'CockroachDB', 'TiDB', 'YugabyteDB', 'Vitess',
];

const DATA_AI_ML = [
  'Machine Learning', 'Deep Learning', 'Neural Networks', 'NLP', 'Computer Vision',
  'Reinforcement Learning', 'Supervised Learning', 'Unsupervised Learning',
  'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'sklearn', 'XGBoost', 'LightGBM',
  'CatBoost', 'Hugging Face', 'Transformers', 'BERT', 'GPT', 'LLM', 'RAG',
  'LangChain', 'LlamaIndex', 'OpenAI', 'Anthropic', 'Claude', 'ChatGPT',
  'Pandas', 'NumPy', 'SciPy', 'Matplotlib', 'Seaborn', 'Plotly', 'Bokeh',
  'Jupyter', 'JupyterLab', 'Colab', 'Kaggle', 'MLflow', 'Kubeflow', 'Airflow',
  'dbt', 'Spark', 'PySpark', 'Hadoop', 'Hive', 'Pig', 'Flink', 'Kafka', 'Kinesis',
  'ETL', 'ELT', 'Data Pipeline', 'Data Warehouse', 'Data Lake', 'Data Mesh',
  'Business Intelligence', 'BI', 'Tableau', 'Power BI', 'Looker', 'Metabase',
  'Data Mining', 'Data Analysis', 'Data Science', 'Big Data', 'Analytics',
  'A/B Testing', 'Statistical Analysis', 'Predictive Analytics', 'Data Modeling',
  'CUDA', 'cuDNN', 'TensorRT', 'ONNX', 'MLOps', 'Feature Store', 'Model Serving',
];

const SECURITY = [
  'Cybersecurity', 'Cybersécurité', 'Security', 'Sécurité', 'InfoSec',
  'Penetration Testing', 'Pentest', 'Ethical Hacking', 'Bug Bounty',
  'OWASP', 'SAST', 'DAST', 'IAST', 'SCA', 'DevSecOps', 'SecOps',
  'SOC', 'SIEM', 'IDS', 'IPS', 'WAF', 'Firewall', 'VPN', 'Zero Trust',
  'IAM', 'RBAC', 'OAuth', 'OIDC', 'SAML', 'SSO', 'MFA', '2FA', 'JWT',
  'Encryption', 'Cryptography', 'PKI', 'SSL', 'TLS', 'HTTPS',
  'Compliance', 'GDPR', 'RGPD', 'HIPAA', 'SOC2', 'ISO 27001', 'PCI DSS',
  'Vulnerability Assessment', 'Risk Management', 'Incident Response',
  'Forensics', 'Malware Analysis', 'Threat Intelligence', 'Red Team', 'Blue Team',
  'Burp Suite', 'Metasploit', 'Nmap', 'Wireshark', 'Snort', 'Suricata',
];

const TOOLS_DEV = [
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial',
  'VS Code', 'Visual Studio', 'IntelliJ', 'WebStorm', 'PyCharm', 'Eclipse',
  'Xcode', 'Android Studio', 'Vim', 'Neovim', 'Emacs', 'Sublime Text', 'Atom',
  'Postman', 'Insomnia', 'Swagger', 'OpenAPI', 'REST', 'RESTful', 'API',
  'gRPC', 'WebSocket', 'Socket.io', 'MQTT', 'AMQP', 'RabbitMQ', 'ActiveMQ',
  'Jira', 'Confluence', 'Trello', 'Asana', 'Monday', 'Linear', 'Notion',
  'Slack', 'Teams', 'Discord', 'Zoom', 'Meet',
  'Figma', 'Sketch', 'Adobe XD', 'InVision', 'Zeplin', 'Framer',
  'npm', 'yarn', 'pnpm', 'pip', 'conda', 'Maven', 'Gradle', 'Cargo', 'Composer',
  'Webpack', 'Vite', 'Rollup', 'Parcel', 'esbuild', 'SWC', 'Babel', 'ESLint',
  'Prettier', 'Jest', 'Mocha', 'Chai', 'Cypress', 'Playwright', 'Selenium',
  'Puppeteer', 'TestCafe', 'Vitest', 'pytest', 'JUnit', 'NUnit', 'xUnit',
  'Storybook', 'Chromatic', 'Percy', 'Applitools',
];

// ═══════════════════════════════════════════════════════════════
// FINANCE, COMPTABILITÉ & GESTION
// ═══════════════════════════════════════════════════════════════

const FINANCE_COMPTA = [
  'Comptabilité', 'Accounting', 'Comptabilité générale', 'Comptabilité analytique',
  'Contrôle de gestion', 'Controlling', 'Audit', 'Audit interne', 'Audit externe',
  'Finance', 'Finance d\'entreprise', 'Corporate Finance', 'Trésorerie', 'Treasury',
  'Fiscalité', 'Tax', 'Droit fiscal', 'TVA', 'Impôts', 'Consolidation',
  'Reporting', 'Reporting financier', 'Financial Reporting', 'IFRS', 'US GAAP',
  'Normes comptables', 'PCG', 'Plan comptable', 'Bilan', 'Compte de résultat',
  'Cash-flow', 'Flux de trésorerie', 'Budget', 'Budgeting', 'Forecast', 'Prévisions',
  'SAP', 'SAP FI', 'SAP CO', 'Oracle Financials', 'Sage', 'Sage 100', 'Cegid',
  'QuickBooks', 'Xero', 'FreshBooks', 'Wave', 'Pennylane', 'Qonto',
  'Excel', 'VBA', 'Power Query', 'Power Pivot', 'Tableaux croisés dynamiques',
  'Analyse financière', 'Financial Analysis', 'Ratios financiers', 'KPI',
  'M&A', 'Fusions-acquisitions', 'Due Diligence', 'Valorisation', 'Valuation',
  'Private Equity', 'Venture Capital', 'Investment Banking', 'Asset Management',
  'Risk Management', 'Gestion des risques', 'ALM', 'Crédit', 'Credit Analysis',
  'Bloomberg', 'Reuters', 'Trading', 'Front Office', 'Middle Office', 'Back Office',
  'Compliance', 'Conformité', 'KYC', 'AML', 'Bâle III', 'Solvency II', 'MiFID',
];

// ═══════════════════════════════════════════════════════════════
// RESSOURCES HUMAINES
// ═══════════════════════════════════════════════════════════════

const RH = [
  'Ressources Humaines', 'RH', 'HR', 'Human Resources', 'People', 'People Ops',
  'Recrutement', 'Recruitment', 'Talent Acquisition', 'Sourcing', 'Chasse de têtes',
  'Headhunting', 'ATS', 'LinkedIn Recruiter', 'Indeed', 'Welcome to the Jungle',
  'Entretien', 'Interview', 'Onboarding', 'Intégration', 'Offboarding',
  'Formation', 'Training', 'Learning & Development', 'L&D', 'E-learning',
  'GPEC', 'GEPP', 'Gestion des compétences', 'Talent Management', 'Gestion des talents',
  'Paie', 'Payroll', 'Administration du personnel', 'SIRH', 'HRIS',
  'Workday', 'SAP HR', 'SuccessFactors', 'Oracle HCM', 'Talentsoft', 'Cornerstone',
  'BambooHR', 'Personio', 'Lucca', 'PayFit', 'Silae', 'ADP',
  'Droit du travail', 'Droit social', 'Relations sociales', 'CSE', 'IRP',
  'Convention collective', 'Négociation', 'Dialogue social', 'Syndicats',
  'QVCT', 'QVT', 'Bien-être', 'Wellness', 'Employee Experience',
  'Marque employeur', 'Employer Branding', 'Culture d\'entreprise', 'Engagement',
  'Performance', 'Évaluation', 'Feedback', 'OKR', 'Objectifs',
  'Rémunération', 'Compensation', 'Benefits', 'Avantages sociaux', 'Incentives',
  'Diversité', 'Inclusion', 'D&I', 'DEI', 'Handicap', 'Égalité', 'Parité',
  'Mobilité', 'Mobilité interne', 'Expatriation', 'Remote', 'Télétravail', 'Flex office',
];

// ═══════════════════════════════════════════════════════════════
// MARKETING, COMMUNICATION & DIGITAL
// ═══════════════════════════════════════════════════════════════

const MARKETING_COM = [
  'Marketing', 'Marketing digital', 'Digital Marketing', 'Growth', 'Growth Hacking',
  'Acquisition', 'User Acquisition', 'Retention', 'Conversion', 'Funnel',
  'SEO', 'Référencement naturel', 'SEA', 'Référencement payant', 'SEM',
  'Google Ads', 'AdWords', 'Facebook Ads', 'Meta Ads', 'LinkedIn Ads', 'TikTok Ads',
  'Display', 'Programmatique', 'RTB', 'DSP', 'SSP', 'DMP', 'CDP',
  'Content Marketing', 'Marketing de contenu', 'Inbound Marketing', 'Outbound',
  'Email Marketing', 'Newsletter', 'Emailing', 'Automation', 'Marketing Automation',
  'Mailchimp', 'Sendinblue', 'Brevo', 'HubSpot', 'Marketo', 'Pardot', 'ActiveCampaign',
  'CRM', 'Salesforce', 'Dynamics', 'Pipedrive', 'Zoho', 'Monday CRM',
  'Social Media', 'Community Management', 'CM', 'Réseaux sociaux', 'SMO', 'SMM',
  'Instagram', 'Facebook', 'LinkedIn', 'Twitter', 'X', 'TikTok', 'YouTube', 'Pinterest',
  'Influencer Marketing', 'Influence', 'KOL', 'Brand Content', 'Storytelling',
  'Communication', 'Relations Presse', 'PR', 'RP', 'Relations Publiques', 'Média',
  'Communication corporate', 'Communication interne', 'Communication de crise',
  'Événementiel', 'Event', 'Salon', 'Conférence', 'Webinar', 'Webinaire',
  'Branding', 'Brand Management', 'Identité visuelle', 'Charte graphique', 'Logo',
  'Copywriting', 'Rédaction', 'Rédaction web', 'UX Writing', 'Tone of Voice',
  'Google Analytics', 'GA4', 'Google Tag Manager', 'GTM', 'Matomo', 'Mixpanel',
  'Amplitude', 'Hotjar', 'Contentsquare', 'AB Tasty', 'Optimizely', 'VWO',
  'Affiliation', 'Partenariats', 'Co-marketing', 'Sponsoring',
  'Product Marketing', 'PMM', 'Go-to-Market', 'GTM', 'Launch', 'Positioning',
];

// ═══════════════════════════════════════════════════════════════
// VENTE & COMMERCE
// ═══════════════════════════════════════════════════════════════

const VENTE = [
  'Vente', 'Sales', 'Commercial', 'Business Development', 'BizDev',
  'Account Executive', 'AE', 'Account Manager', 'AM', 'Key Account Manager', 'KAM',
  'SDR', 'Sales Development', 'BDR', 'Business Development Representative',
  'Inside Sales', 'Outside Sales', 'Field Sales', 'Terrain',
  'B2B', 'B2C', 'B2B2C', 'Enterprise', 'Mid-Market', 'SMB', 'TPE', 'PME', 'ETI',
  'Prospection', 'Cold Calling', 'Cold Email', 'Lead Generation', 'Leads',
  'Pipeline', 'Forecast', 'Closing', 'Négociation', 'Negotiation',
  'Upsell', 'Cross-sell', 'Renewal', 'Churn', 'Retention', 'Customer Success', 'CS',
  'CRM', 'Salesforce', 'HubSpot', 'Pipedrive', 'Zoho CRM', 'Close',
  'SaaS', 'ARR', 'MRR', 'LTV', 'CAC', 'NRR', 'Quota', 'Commission',
  'Solution Selling', 'Consultative Selling', 'SPIN', 'MEDDIC', 'Challenger Sale',
  'Partnership', 'Channel', 'Indirect Sales', 'Reseller', 'Distributeur',
  'Retail', 'Grande distribution', 'GMS', 'GSS', 'Franchise', 'Réseau',
  'E-commerce', 'Marketplace', 'Amazon', 'Shopify', 'PrestaShop', 'WooCommerce',
  'Merchandising', 'Category Management', 'Trade Marketing', 'Promotion',
  'Export', 'International', 'Business Development International',
];

// ═══════════════════════════════════════════════════════════════
// JURIDIQUE & DROIT
// ═══════════════════════════════════════════════════════════════

const JURIDIQUE = [
  'Droit', 'Juridique', 'Legal', 'Juriste', 'Avocat', 'Lawyer', 'Attorney',
  'Droit des affaires', 'Business Law', 'Corporate Law', 'Droit des sociétés',
  'Droit commercial', 'Commercial Law', 'Droit des contrats', 'Contract Law',
  'Contrats', 'Négociation contractuelle', 'Rédaction de contrats', 'CLM',
  'Propriété intellectuelle', 'IP', 'PI', 'Brevets', 'Patents', 'Marques', 'Trademarks',
  'Droit d\'auteur', 'Copyright', 'Licences', 'Licensing',
  'RGPD', 'GDPR', 'Data Privacy', 'Protection des données', 'DPO', 'Privacy',
  'Compliance', 'Conformité', 'Regulatory', 'Réglementation',
  'Droit du travail', 'Employment Law', 'Labor Law', 'Contentieux', 'Litigation',
  'Droit pénal', 'Criminal Law', 'Droit fiscal', 'Tax Law', 'Fiscalité',
  'M&A', 'Fusions-acquisitions', 'Due Diligence', 'Corporate Governance',
  'Droit bancaire', 'Banking Law', 'Droit financier', 'Financial Regulation',
  'Droit immobilier', 'Real Estate Law', 'Baux', 'Urbanisme',
  'Droit de la concurrence', 'Competition Law', 'Antitrust',
  'Droit européen', 'EU Law', 'Droit international', 'International Law',
  'Arbitrage', 'Médiation', 'ADR', 'Règlement des litiges',
  'Legal Tech', 'LegalTech', 'Contract Management', 'E-discovery',
];

// ═══════════════════════════════════════════════════════════════
// SANTÉ & MÉDICAL
// ═══════════════════════════════════════════════════════════════

const SANTE = [
  'Santé', 'Healthcare', 'Health', 'Médical', 'Medical', 'Médecine', 'Medicine',
  'Médecin', 'Doctor', 'Physician', 'Infirmier', 'Infirmière', 'Nurse', 'IDE',
  'Pharmacien', 'Pharmacist', 'Pharmacie', 'Pharmacy', 'Officine',
  'Hôpital', 'Hospital', 'Clinique', 'Clinic', 'CHU', 'AP-HP', 'EHPAD',
  'Laboratoire', 'Laboratory', 'Lab', 'Biologie', 'Biology', 'Analyses',
  'Recherche clinique', 'Clinical Research', 'Essais cliniques', 'Clinical Trials',
  'ARC', 'CRA', 'TEC', 'Investigateur', 'Protocole', 'ICH-GCP', 'BPC',
  'Pharma', 'Pharmaceutique', 'Pharmaceutical', 'Biotech', 'Biotechnologie',
  'R&D', 'Drug Development', 'Développement', 'Préclinique', 'Réglementaire',
  'Affaires réglementaires', 'Regulatory Affairs', 'AMM', 'FDA', 'EMA', 'ANSM',
  'Pharmacovigilance', 'Drug Safety', 'Assurance Qualité', 'QA', 'QC',
  'Medical Affairs', 'Affaires médicales', 'MSL', 'Medical Science Liaison',
  'Dispositifs médicaux', 'Medical Devices', 'DM', 'Marquage CE',
  'E-santé', 'Digital Health', 'Télémédecine', 'Telemedicine', 'MedTech',
  'Imagerie médicale', 'Radiologie', 'IRM', 'Scanner', 'Échographie',
  'Chirurgie', 'Surgery', 'Anesthésie', 'Réanimation', 'Urgences', 'SAMU',
  'Pédiatrie', 'Gériatrie', 'Cardiologie', 'Oncologie', 'Neurologie', 'Psychiatrie',
  'Kinésithérapie', 'Physiotherapy', 'Ostéopathie', 'Ergothérapie', 'Orthophonie',
  'Dentaire', 'Dental', 'Orthodontie', 'Ophtalmologie', 'Optique', 'Audioprothèse',
];

// ═══════════════════════════════════════════════════════════════
// INDUSTRIE & INGÉNIERIE
// ═══════════════════════════════════════════════════════════════

const INDUSTRIE = [
  'Industrie', 'Industry', 'Manufacturing', 'Production', 'Usine', 'Factory',
  'Ingénierie', 'Engineering', 'Ingénieur', 'Engineer', 'Bureau d\'études', 'BE',
  'Mécanique', 'Mechanical', 'Électrique', 'Electrical', 'Électronique', 'Electronics',
  'Automatisme', 'Automation', 'PLC', 'Automate', 'Siemens', 'Schneider', 'Allen-Bradley',
  'Robotique', 'Robotics', 'Robot', 'Cobot', 'AGV', 'AMR',
  'CAO', 'CAD', 'DAO', 'CATIA', 'SolidWorks', 'AutoCAD', 'Inventor', 'Creo', 'NX',
  'FAO', 'CAM', 'CFAO', 'Usinage', 'CNC', 'Fraisage', 'Tournage', 'Injection',
  'Lean', 'Lean Manufacturing', 'Six Sigma', 'Kaizen', '5S', 'TPM', 'SMED',
  'Amélioration continue', 'Continuous Improvement', 'Excellence opérationnelle',
  'Qualité', 'Quality', 'ISO 9001', 'ISO 14001', 'IATF 16949', 'Audit qualité',
  'Supply Chain', 'Logistique', 'Logistics', 'Approvisionnement', 'Procurement',
  'Achats', 'Purchasing', 'Sourcing', 'Négociation fournisseurs', 'SRM',
  'Maintenance', 'GMAO', 'CMMS', 'Maintenance préventive', 'Maintenance corrective',
  'HSE', 'Sécurité', 'Environnement', 'EHS', 'QSE', 'QHSE', 'RSE', 'CSR',
  'Énergie', 'Energy', 'EnR', 'Renouvelable', 'Renewable', 'Solaire', 'Éolien',
  'Nucléaire', 'Nuclear', 'Pétrole', 'Oil & Gas', 'Chimie', 'Chemistry',
  'Aéronautique', 'Aerospace', 'Aviation', 'Défense', 'Defense', 'Spatial', 'Space',
  'Automobile', 'Automotive', 'Ferroviaire', 'Railway', 'Naval', 'Maritime',
  'BTP', 'Construction', 'Génie civil', 'Civil Engineering', 'Architecture',
  'Chantier', 'Travaux', 'Maîtrise d\'ouvrage', 'MOA', 'Maîtrise d\'oeuvre', 'MOE',
];

// ═══════════════════════════════════════════════════════════════
// DESIGN & CRÉATION
// ═══════════════════════════════════════════════════════════════

const DESIGN = [
  'Design', 'Designer', 'UX', 'User Experience', 'UI', 'User Interface', 'UX/UI',
  'Product Design', 'Design Produit', 'Web Design', 'Webdesign', 'Graphic Design',
  'Graphisme', 'Graphiste', 'Direction artistique', 'DA', 'Art Director',
  'Identité visuelle', 'Branding', 'Logo', 'Charte graphique', 'Brand Guidelines',
  'Illustration', 'Illustrateur', 'Illustrator', 'Dessin', 'Drawing',
  'Motion Design', 'Animation', 'After Effects', 'Cinema 4D', 'Blender', 'Maya',
  '3D', 'Modélisation 3D', '3D Modeling', 'Rendu 3D', '3D Rendering', 'V-Ray',
  'Figma', 'Sketch', 'Adobe XD', 'InVision', 'Zeplin', 'Framer', 'Principle',
  'Photoshop', 'Illustrator', 'InDesign', 'Lightroom', 'Premiere Pro', 'Final Cut',
  'Suite Adobe', 'Adobe Creative Cloud', 'Creative Suite', 'Canva',
  'Design System', 'Component Library', 'Atomic Design', 'Design Tokens',
  'Prototypage', 'Prototyping', 'Wireframe', 'Maquette', 'Mockup', 'Zoning',
  'User Research', 'Recherche utilisateur', 'Tests utilisateurs', 'Usability',
  'Accessibilité', 'Accessibility', 'WCAG', 'A11y', 'Inclusive Design',
  'Design Thinking', 'Sprint Design', 'Atelier', 'Workshop', 'Co-création',
  'Typographie', 'Typography', 'Couleur', 'Color Theory', 'Composition', 'Layout',
  'Print', 'Impression', 'PAO', 'DTP', 'Packaging', 'PLV', 'Signalétique',
  'Photographie', 'Photography', 'Vidéo', 'Video', 'Montage', 'Editing', 'Réalisation',
];

// ═══════════════════════════════════════════════════════════════
// PRODUIT & PROJET
// ═══════════════════════════════════════════════════════════════

const PRODUIT_PROJET = [
  'Product', 'Produit', 'Product Manager', 'PM', 'Product Owner', 'PO',
  'Product Management', 'Product Strategy', 'Product Vision', 'Product Discovery',
  'Roadmap', 'Backlog', 'User Stories', 'Épopée', 'Epic', 'Feature', 'Release',
  'MVP', 'POC', 'Prototype', 'Beta', 'GA', 'Launch', 'Go-to-Market',
  'Projet', 'Project', 'Project Manager', 'Chef de projet', 'Project Management',
  'PMO', 'Portfolio', 'Programme', 'Program Manager',
  'Agile', 'Scrum', 'Kanban', 'SAFe', 'LeSS', 'Spotify Model', 'Shape Up',
  'Sprint', 'Daily', 'Stand-up', 'Rétrospective', 'Retro', 'Planning', 'Review',
  'Scrum Master', 'Agile Coach', 'Facilitateur', 'Transformation Agile',
  'Waterfall', 'Cycle en V', 'Prince2', 'PMP', 'PMBOK', 'ITIL',
  'Gestion de projet', 'Planning', 'Gantt', 'PERT', 'Jalons', 'Milestones',
  'Budget', 'Coûts', 'Délais', 'Risques', 'Qualité', 'Scope', 'Périmètre',
  'Stakeholders', 'Parties prenantes', 'Comité de pilotage', 'COPIL', 'Steering',
  'Change Management', 'Conduite du changement', 'Transformation', 'Transition',
  'Business Analysis', 'Analyse métier', 'Requirements', 'Spécifications', 'Specs',
  'Jira', 'Confluence', 'Trello', 'Asana', 'Monday', 'Notion', 'Linear', 'Productboard',
  'Amplitude', 'Mixpanel', 'Pendo', 'Hotjar', 'FullStory', 'Analytics',
  'OKR', 'KPI', 'Metrics', 'North Star', 'Impact', 'Outcomes', 'Output',
];

// ═══════════════════════════════════════════════════════════════
// SUPPORT & SERVICE CLIENT
// ═══════════════════════════════════════════════════════════════

const SUPPORT = [
  'Support', 'Support client', 'Customer Support', 'Service client', 'Customer Service',
  'Helpdesk', 'Help Desk', 'Service Desk', 'Support technique', 'Technical Support',
  'Niveau 1', 'N1', 'Niveau 2', 'N2', 'Niveau 3', 'N3', 'Escalade', 'Escalation',
  'Ticketing', 'Ticket', 'Incident', 'Demande', 'Request', 'SLA', 'KPI',
  'Zendesk', 'Freshdesk', 'Intercom', 'Crisp', 'ServiceNow', 'Jira Service Management',
  'Salesforce Service Cloud', 'HubSpot Service Hub',
  'Customer Success', 'CS', 'CSM', 'Customer Success Manager', 'Adoption',
  'Onboarding', 'Accompagnement', 'Formation client', 'Training',
  'NPS', 'Net Promoter Score', 'CSAT', 'Customer Satisfaction', 'CES',
  'Churn', 'Rétention', 'Fidélisation', 'Loyalty', 'Upsell', 'Expansion',
  'Call center', 'Centre d\'appels', 'Téléconseiller', 'Hotline', 'Chat',
  'Chatbot', 'Bot', 'FAQ', 'Knowledge Base', 'Base de connaissances', 'Self-service',
  'Réclamation', 'Complaint', 'Litige', 'SAV', 'Après-vente', 'Garantie',
  'Relation client', 'Customer Relationship', 'CRM', 'Experience client', 'CX',
];

// ═══════════════════════════════════════════════════════════════
// LOGISTIQUE & TRANSPORT
// ═══════════════════════════════════════════════════════════════

const LOGISTIQUE = [
  'Logistique', 'Logistics', 'Supply Chain', 'SCM', 'Supply Chain Management',
  'Transport', 'Transportation', 'Freight', 'Fret', 'Shipping', 'Livraison', 'Delivery',
  'Entrepôt', 'Warehouse', 'Stockage', 'Storage', 'WMS', 'Warehouse Management',
  'Préparation de commandes', 'Picking', 'Packing', 'Expédition', 'Réception',
  'Inventaire', 'Inventory', 'Stock', 'Gestion des stocks', 'Inventory Management',
  'Flux', 'Flow', 'Flux tendu', 'Just-in-time', 'JIT', 'Cross-docking',
  'Approvisionnement', 'Procurement', 'Sourcing', 'Achat', 'Purchasing',
  'Fournisseur', 'Supplier', 'Vendor', 'SRM', 'Supplier Relationship Management',
  'Planning', 'S&OP', 'Sales & Operations Planning', 'Demand Planning', 'MRP', 'ERP',
  'SAP', 'SAP MM', 'SAP SD', 'SAP WM', 'Oracle SCM', 'Manhattan', 'Blue Yonder',
  'Douane', 'Customs', 'Import', 'Export', 'Incoterms', 'Commerce international',
  'Last mile', 'Dernier kilomètre', 'Reverse logistics', 'Retours',
  'Transporteur', 'Carrier', 'TMS', 'Transport Management', 'Affrètement',
  'Route', 'Maritime', 'Aérien', 'Ferroviaire', 'Multimodal', 'Intermodal',
  'ADR', 'Matières dangereuses', 'Chaîne du froid', 'Cold chain', 'Température',
  'Traçabilité', 'Traceability', 'RFID', 'Code-barres', 'Barcode', 'EDI',
  'Lean', 'Kaizen', 'Amélioration continue', 'Optimisation', 'Productivité',
];

// ═══════════════════════════════════════════════════════════════
// ÉDUCATION & FORMATION
// ═══════════════════════════════════════════════════════════════

const EDUCATION = [
  'Éducation', 'Education', 'Enseignement', 'Teaching', 'Professeur', 'Teacher',
  'Formateur', 'Trainer', 'Formation', 'Training', 'Pédagogie', 'Pedagogy',
  'E-learning', 'Digital Learning', 'Blended Learning', 'MOOC', 'LMS',
  'Moodle', 'Canvas', 'Blackboard', '360Learning', 'Teachable', 'Coursera', 'Udemy',
  'Ingénierie pédagogique', 'Instructional Design', 'Conception pédagogique',
  'Contenu pédagogique', 'Learning Content', 'Module', 'Parcours', 'Curriculum',
  'Évaluation', 'Assessment', 'Certification', 'Diplôme', 'Degree',
  'Université', 'University', 'École', 'School', 'Grande école', 'Business School',
  'Recherche', 'Research', 'PhD', 'Doctorat', 'Master', 'Licence', 'Bachelor',
  'Étudiant', 'Student', 'Stagiaire', 'Apprenti', 'Alternant', 'Alternance',
  'CPF', 'OPCO', 'Plan de formation', 'Compétences', 'Skills', 'Upskilling',
  'Reskilling', 'Reconversion', 'Évolution professionnelle', 'Career Development',
  'Tutorat', 'Tutoring', 'Mentorat', 'Mentoring', 'Coaching', 'Accompagnement',
  'Soft skills', 'Hard skills', 'Compétences transversales', 'Savoir-être', 'Savoir-faire',
];

// ═══════════════════════════════════════════════════════════════
// IMMOBILIER
// ═══════════════════════════════════════════════════════════════

const IMMOBILIER = [
  'Immobilier', 'Real Estate', 'Property', 'Immobilier d\'entreprise', 'Commercial Real Estate',
  'Résidentiel', 'Residential', 'Tertiaire', 'Bureau', 'Office', 'Retail', 'Commerce',
  'Logistique', 'Industriel', 'Industrial', 'Hôtellerie', 'Hospitality',
  'Transaction', 'Vente', 'Achat', 'Location', 'Rental', 'Bail', 'Lease',
  'Agent immobilier', 'Real Estate Agent', 'Négociateur', 'Mandataire',
  'Property Management', 'Gestion immobilière', 'Syndic', 'Copropriété',
  'Asset Management', 'Investment Management', 'SCPI', 'OPCI', 'SIIC', 'REIT',
  'Promotion immobilière', 'Property Development', 'Promoteur', 'Developer',
  'Maîtrise d\'ouvrage', 'MOA', 'Maîtrise d\'oeuvre', 'MOE', 'AMO',
  'BTP', 'Construction', 'Rénovation', 'Réhabilitation', 'Aménagement',
  'Architecture', 'Architecte', 'Urbanisme', 'Urban Planning', 'Permis de construire',
  'Expertise', 'Évaluation', 'Valuation', 'Estimation', 'Diagnostics', 'DPE',
  'Financement', 'Crédit immobilier', 'Mortgage', 'Investissement', 'Investment',
  'Facility Management', 'FM', 'Services généraux', 'Maintenance', 'Travaux',
  'Smart Building', 'BIM', 'Building Information Modeling', 'PropTech',
];

// ═══════════════════════════════════════════════════════════════
// HÔTELLERIE, RESTAURATION & TOURISME
// ═══════════════════════════════════════════════════════════════

const HOTELLERIE_TOURISME = [
  'Hôtellerie', 'Hospitality', 'Hôtel', 'Hotel', 'Resort', 'Palace', 'Boutique Hotel',
  'Restauration', 'Restaurant', 'F&B', 'Food & Beverage', 'Cuisine', 'Chef',
  'Service', 'Salle', 'Bar', 'Sommelier', 'Maître d\'hôtel', 'Concierge',
  'Réception', 'Front Office', 'Back Office', 'Housekeeping', 'Étages',
  'Revenue Management', 'Yield Management', 'Pricing', 'Tarification', 'ADR', 'RevPAR',
  'PMS', 'Property Management System', 'Opera', 'Fidelio', 'Mews', 'Cloudbeds',
  'OTA', 'Booking.com', 'Expedia', 'Airbnb', 'Hotels.com', 'Channel Manager',
  'Tourisme', 'Tourism', 'Travel', 'Voyage', 'Tour Operator', 'TO', 'Agence de voyage',
  'GDS', 'Amadeus', 'Sabre', 'Galileo', 'Travelport', 'Billetterie', 'Ticketing',
  'MICE', 'Événementiel', 'Events', 'Congrès', 'Séminaire', 'Incentive',
  'Spa', 'Wellness', 'Bien-être', 'Loisirs', 'Entertainment', 'Animation',
  'Aérien', 'Aviation', 'Compagnie aérienne', 'Airline', 'Aéroport', 'Airport',
  'Croisière', 'Cruise', 'Maritime', 'Ferroviaire', 'SNCF', 'Train',
  'Destination', 'DMO', 'Office de tourisme', 'Guide', 'Patrimoine', 'Culture',
  'Écotourisme', 'Tourisme durable', 'Sustainable Tourism', 'Responsable',
];

// ═══════════════════════════════════════════════════════════════
// MÉDIA & ÉDITION
// ═══════════════════════════════════════════════════════════════

const MEDIA = [
  'Média', 'Media', 'Presse', 'Press', 'Journalisme', 'Journalism', 'Journaliste',
  'Rédaction', 'Editorial', 'Rédacteur', 'Editor', 'Rédacteur en chef', 'Editor in Chief',
  'Contenu', 'Content', 'Article', 'Reportage', 'Interview', 'Enquête', 'Investigation',
  'Web', 'Print', 'Magazine', 'Journal', 'Quotidien', 'Hebdomadaire', 'Mensuel',
  'Audiovisuel', 'Broadcast', 'Radio', 'Télévision', 'TV', 'Podcast', 'Streaming',
  'Production', 'Post-production', 'Montage', 'Editing', 'Réalisation', 'Direction',
  'Vidéo', 'Video', 'Son', 'Audio', 'Image', 'Caméra', 'Camera', 'Lumière', 'Lighting',
  'Édition', 'Publishing', 'Éditeur', 'Publisher', 'Livre', 'Book', 'Ebook',
  'Traduction', 'Translation', 'Localisation', 'Localization', 'Interprétariat',
  'Copyright', 'Droits d\'auteur', 'Droits', 'Rights', 'Licensing', 'Syndication',
  'SEO', 'Référencement', 'Analytics', 'Audience', 'Trafic', 'Traffic', 'Engagement',
  'Abonnement', 'Subscription', 'Paywall', 'Monétisation', 'Monetization', 'Publicité',
  'Social Media', 'Réseaux sociaux', 'Community Management', 'Influence', 'Viral',
  'Fact-checking', 'Vérification', 'Sources', 'Déontologie', 'Ethics',
];

// ═══════════════════════════════════════════════════════════════
// AGRICULTURE & AGROALIMENTAIRE
// ═══════════════════════════════════════════════════════════════

const AGRICULTURE = [
  'Agriculture', 'Agricole', 'Agricultural', 'Ferme', 'Farm', 'Exploitation',
  'Élevage', 'Livestock', 'Cultures', 'Crops', 'Céréales', 'Grains', 'Viticulture',
  'Vin', 'Wine', 'Œnologie', 'Maraîchage', 'Horticulture', 'Arboriculture',
  'Bio', 'Organic', 'Agriculture biologique', 'Agroécologie', 'Permaculture',
  'Agroalimentaire', 'Food', 'Food Industry', 'IAA', 'Industrie alimentaire',
  'Transformation', 'Processing', 'Production', 'Conditionnement', 'Packaging',
  'Qualité', 'HACCP', 'IFS', 'BRC', 'ISO 22000', 'Sécurité alimentaire', 'Food Safety',
  'R&D', 'Formulation', 'Nutrition', 'Ingrédients', 'Additifs', 'Clean Label',
  'Supply Chain', 'Approvisionnement', 'Matières premières', 'Commodities',
  'Distribution', 'GMS', 'Grande distribution', 'Retail', 'Foodservice', 'RHF',
  'Export', 'International', 'Commerce agricole', 'Négoce', 'Trading',
  'Coopérative', 'Coopérative agricole', 'Groupement', 'Filière',
  'AgriTech', 'FoodTech', 'Agriculture de précision', 'Precision Agriculture',
  'IoT', 'Capteurs', 'Drones', 'GPS', 'SIG', 'GIS', 'Télédétection',
  'Développement durable', 'Sustainability', 'RSE', 'Environnement', 'Biodiversité',
];

// ═══════════════════════════════════════════════════════════════
// ENVIRONNEMENT & DÉVELOPPEMENT DURABLE
// ═══════════════════════════════════════════════════════════════

const ENVIRONNEMENT = [
  'Environnement', 'Environment', 'Développement durable', 'Sustainable Development',
  'RSE', 'CSR', 'Corporate Social Responsibility', 'Responsabilité sociétale',
  'ESG', 'Environmental Social Governance', 'Impact', 'Purpose', 'Mission',
  'Climat', 'Climate', 'Carbone', 'Carbon', 'Bilan carbone', 'Carbon Footprint',
  'Neutralité carbone', 'Carbon Neutral', 'Net Zero', 'Décarbonation', 'GES',
  'Énergie', 'Energy', 'Énergies renouvelables', 'Renewable Energy', 'EnR',
  'Solaire', 'Solar', 'Éolien', 'Wind', 'Hydraulique', 'Hydro', 'Biomasse', 'Géothermie',
  'Transition énergétique', 'Energy Transition', 'Efficacité énergétique',
  'Économie circulaire', 'Circular Economy', 'Recyclage', 'Recycling', 'Valorisation',
  'Déchets', 'Waste', 'Gestion des déchets', 'Waste Management', 'Tri',
  'Eau', 'Water', 'Assainissement', 'Traitement', 'Épuration', 'Ressources',
  'Biodiversité', 'Biodiversity', 'Écosystèmes', 'Nature', 'Conservation',
  'Pollution', 'Émissions', 'Qualité de l\'air', 'Air Quality', 'Bruit', 'Nuisances',
  'Réglementation', 'Compliance', 'ISO 14001', 'ICPE', 'Études d\'impact', 'EIE',
  'Certification', 'Label', 'B Corp', 'EcoVadis', 'CDP', 'GRI', 'TCFD', 'CSRD',
  'Green', 'Vert', 'Durable', 'Sustainable', 'Responsable', 'Éthique', 'Ethical',
];

// ═══════════════════════════════════════════════════════════════
// SOFT SKILLS & COMPÉTENCES TRANSVERSALES
// ═══════════════════════════════════════════════════════════════

const SOFT_SKILLS = [
  // Leadership & Management
  'Leadership', 'Management', 'Manager', 'Encadrement', 'Direction', 'Pilotage',
  'Gestion d\'équipe', 'Team Management', 'People Management', 'Coaching', 'Mentoring',
  'Délégation', 'Motivation', 'Feedback', 'Évaluation', 'Performance',
  'Vision', 'Stratégie', 'Strategy', 'Décision', 'Decision Making', 'Prise de décision',

  // Communication
  'Communication', 'Communication orale', 'Communication écrite', 'Présentation',
  'Public Speaking', 'Prise de parole', 'Éloquence', 'Pitch', 'Storytelling',
  'Écoute', 'Listening', 'Écoute active', 'Active Listening', 'Empathie', 'Empathy',
  'Assertivité', 'Diplomatie', 'Influence', 'Persuasion', 'Conviction',

  // Collaboration
  'Travail d\'équipe', 'Teamwork', 'Collaboration', 'Coopération', 'Esprit d\'équipe',
  'Transversalité', 'Cross-functional', 'Interdisciplinaire', 'Multidisciplinaire',
  'Relationnel', 'Interpersonal', 'Networking', 'Réseau', 'Partenariat',

  // Organisation
  'Organisation', 'Planification', 'Planning', 'Priorisation', 'Prioritization',
  'Gestion du temps', 'Time Management', 'Productivité', 'Productivity', 'Efficacité',
  'Rigueur', 'Méthode', 'Structuré', 'Fiabilité', 'Reliability', 'Ponctualité',
  'Multi-tâches', 'Multitasking', 'Gestion du stress', 'Stress Management',

  // Résolution de problèmes
  'Résolution de problèmes', 'Problem Solving', 'Analyse', 'Analysis', 'Analytique',
  'Esprit critique', 'Critical Thinking', 'Logique', 'Raisonnement', 'Synthèse',
  'Créativité', 'Creativity', 'Innovation', 'Idéation', 'Brainstorming',
  'Initiative', 'Proactivité', 'Proactive', 'Force de proposition', 'Autonomie',

  // Adaptabilité
  'Adaptabilité', 'Adaptability', 'Flexibilité', 'Flexibility', 'Agilité', 'Agility',
  'Polyvalence', 'Versatility', 'Curiosité', 'Curiosity', 'Apprentissage', 'Learning',
  'Résilience', 'Resilience', 'Gestion du changement', 'Change Management',

  // Négociation & Vente
  'Négociation', 'Negotiation', 'Persuasion', 'Influence', 'Closing',
  'Orientation client', 'Customer Focus', 'Service', 'Satisfaction client',
  'Sens commercial', 'Business Acumen', 'Orientation résultats', 'Results Oriented',
];

// ═══════════════════════════════════════════════════════════════
// LANGUES
// ═══════════════════════════════════════════════════════════════

const LANGUES = [
  // Langues
  'Français', 'French', 'Anglais', 'English', 'Espagnol', 'Spanish', 'Allemand', 'German',
  'Italien', 'Italian', 'Portugais', 'Portuguese', 'Néerlandais', 'Dutch', 'Russe', 'Russian',
  'Chinois', 'Chinese', 'Mandarin', 'Japonais', 'Japanese', 'Coréen', 'Korean',
  'Arabe', 'Arabic', 'Hindi', 'Turc', 'Turkish', 'Polonais', 'Polish', 'Suédois', 'Swedish',
  'Norvégien', 'Norwegian', 'Danois', 'Danish', 'Finnois', 'Finnish', 'Grec', 'Greek',
  'Hébreu', 'Hebrew', 'Tchèque', 'Czech', 'Hongrois', 'Hungarian', 'Roumain', 'Romanian',
  'Vietnamien', 'Vietnamese', 'Thaï', 'Thai', 'Indonésien', 'Indonesian', 'Malais', 'Malay',

  // Niveaux
  'Langue maternelle', 'Native', 'Natif', 'Bilingue', 'Bilingual', 'Courant', 'Fluent',
  'Professionnel', 'Professional', 'Avancé', 'Advanced', 'Intermédiaire', 'Intermediate',
  'Débutant', 'Beginner', 'Notions', 'Basic', 'Scolaire', 'Lu, écrit, parlé',
  'TOEIC', 'TOEFL', 'IELTS', 'Cambridge', 'DELE', 'DALF', 'DELF', 'Goethe', 'HSK', 'JLPT',
  'C2', 'C1', 'B2', 'B1', 'A2', 'A1', 'CECRL', 'CEFR',
];

// ═══════════════════════════════════════════════════════════════
// NIVEAUX D'EXPÉRIENCE & DIPLÔMES
// ═══════════════════════════════════════════════════════════════

const NIVEAUX = [
  // Niveaux d'expérience
  'Junior', 'Confirmé', 'Senior', 'Expert', 'Lead', 'Principal', 'Staff',
  'Débutant', 'Entry Level', 'Mid-level', 'Expérimenté', 'Experienced',
  'Stagiaire', 'Intern', 'Apprenti', 'Alternant', 'Graduate', 'Jeune diplômé',
  'Manager', 'Directeur', 'Director', 'VP', 'Vice President', 'C-Level',
  'CEO', 'CTO', 'CFO', 'COO', 'CMO', 'CHRO', 'CIO', 'CDO', 'CPO',
  'Head of', 'Responsable', 'Superviseur', 'Coordinator', 'Coordinateur',

  // Diplômes & Formations
  'Bac', 'Baccalauréat', 'Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Bac+8',
  'BTS', 'DUT', 'BUT', 'Licence', 'Bachelor', 'Master', 'MBA', 'MS', 'MSc',
  'Doctorat', 'PhD', 'Thèse', 'HDR', 'Ingénieur', 'Engineer', 'Grande école',
  'Université', 'University', 'École de commerce', 'Business School',
  'Formation continue', 'Certificat', 'Certificate', 'Certification',
  'RNCP', 'Titre professionnel', 'VAE', 'CPF', 'Accréditation',
];

// ═══════════════════════════════════════════════════════════════
// TYPES DE CONTRAT & ORGANISATION
// ═══════════════════════════════════════════════════════════════

const CONTRATS_ORGA = [
  // Types de contrat
  'CDI', 'CDD', 'Intérim', 'Freelance', 'Indépendant', 'Consultant', 'Prestataire',
  'Temps plein', 'Full-time', 'Temps partiel', 'Part-time', 'Mi-temps',
  'Stage', 'Alternance', 'Apprentissage', 'Contrat pro', 'VIE', 'VIA',
  'Remote', 'Télétravail', 'Hybrid', 'Hybride', 'Sur site', 'On-site', 'Présentiel',
  'Flex office', 'Coworking', 'Home office', 'Full remote', '100% remote',

  // Types d'organisation
  'Startup', 'Scale-up', 'PME', 'ETI', 'Grand groupe', 'Corporate', 'Multinationale',
  'ESN', 'SSII', 'Cabinet', 'Agence', 'Consulting', 'Conseil',
  'Association', 'ONG', 'Fondation', 'Secteur public', 'Public Sector',
  'B2B', 'B2C', 'B2B2C', 'SaaS', 'Marketplace', 'E-commerce', 'Retail',

  // Méthodologies
  'Agile', 'Scrum', 'Kanban', 'Lean', 'DevOps', 'CI/CD', 'TDD', 'BDD',
  'SAFe', 'Waterfall', 'Prince2', 'ITIL', 'Six Sigma', 'Kaizen',
];

// ═══════════════════════════════════════════════════════════════
// EXPORT FINAL
// ═══════════════════════════════════════════════════════════════

export const KEYWORDS_DATABASE = {
  // Tech
  languages: LANGUAGES,
  frameworksFrontend: FRAMEWORKS_FRONTEND,
  frameworksBackend: FRAMEWORKS_BACKEND,
  frameworksMobile: FRAMEWORKS_MOBILE,
  cloudDevops: CLOUD_DEVOPS,
  databases: DATABASES,
  dataAiMl: DATA_AI_ML,
  security: SECURITY,
  toolsDev: TOOLS_DEV,

  // Business
  financeCompta: FINANCE_COMPTA,
  rh: RH,
  marketingCom: MARKETING_COM,
  vente: VENTE,
  juridique: JURIDIQUE,

  // Secteurs
  sante: SANTE,
  industrie: INDUSTRIE,
  design: DESIGN,
  produitProjet: PRODUIT_PROJET,
  support: SUPPORT,
  logistique: LOGISTIQUE,
  education: EDUCATION,
  immobilier: IMMOBILIER,
  hotellerieTourisme: HOTELLERIE_TOURISME,
  media: MEDIA,
  agriculture: AGRICULTURE,
  environnement: ENVIRONNEMENT,

  // Transversal
  softSkills: SOFT_SKILLS,
  langues: LANGUES,
  niveaux: NIVEAUX,
  contratsOrga: CONTRATS_ORGA,
};

// Flatten all keywords into a single array for fast lookup
export const ALL_KEYWORDS: string[] = Object.values(KEYWORDS_DATABASE).flat();

// Create a Set for O(1) lookup (case-insensitive)
const keywordsLower = new Set(ALL_KEYWORDS.map(k => k.toLowerCase()));

// Variantes et alias courants
const ALIASES: Record<string, string[]> = {
  'javascript': ['js'],
  'typescript': ['ts'],
  'react': ['reactjs', 'react.js'],
  'vue': ['vuejs', 'vue.js'],
  'angular': ['angularjs'],
  'node.js': ['nodejs', 'node'],
  'c++': ['cpp'],
  'c#': ['csharp', 'c sharp'],
  'postgresql': ['postgres', 'psql'],
  'kubernetes': ['k8s'],
  'artificial intelligence': ['ai', 'ia'],
  'machine learning': ['ml'],
  'natural language processing': ['nlp'],
  'continuous integration': ['ci'],
  'continuous deployment': ['cd'],
  'devops': ['dev ops', 'dev-ops'],
  'saas': ['software as a service'],
  'api': ['apis', 'rest api', 'restful api'],
};

// Inverse aliases map for quick lookup
const ALIAS_TO_MAIN: Map<string, string> = new Map();
for (const [main, aliases] of Object.entries(ALIASES)) {
  for (const alias of aliases) {
    ALIAS_TO_MAIN.set(alias.toLowerCase(), main);
  }
}

/**
 * Extrait les mots-clés d'un texte (offre d'emploi ou CV)
 * @param text Le texte à analyser
 * @returns Liste des mots-clés trouvés (dédupliqués)
 */
export function extractKeywords(text: string): string[] {
  const textLower = text.toLowerCase();
  const found = new Set<string>();

  // 1. Chercher les mots-clés exacts
  for (const keyword of ALL_KEYWORDS) {
    const keywordLower = keyword.toLowerCase();
    // Utiliser une regex pour matcher le mot entier (avec boundaries)
    // Gérer les caractères spéciaux dans le keyword (comme C++, C#, .NET)
    const escaped = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s,;.!?()\\[\\]{}'"/-])${escaped}(?:[\\s,;.!?()\\[\\]{}'"/-]|$)`, 'i');

    if (regex.test(textLower) || textLower.includes(keywordLower)) {
      found.add(keyword); // Garder la casse originale du keyword
    }
  }

  // 2. Chercher les alias et les mapper vers le terme principal
  for (const [alias, main] of ALIAS_TO_MAIN) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s,;.!?()\\[\\]{}'"/-])${escaped}(?:[\\s,;.!?()\\[\\]{}'"/-]|$)`, 'i');

    if (regex.test(textLower)) {
      // Trouver le keyword original avec la bonne casse
      const original = ALL_KEYWORDS.find(k => k.toLowerCase() === main.toLowerCase());
      if (original) {
        found.add(original);
      }
    }
  }

  return Array.from(found);
}

/**
 * Extrait les mots-clés avec leur catégorie
 * @param text Le texte à analyser
 * @returns Map des catégories avec leurs mots-clés trouvés
 */
export function extractKeywordsByCategory(text: string): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const textLower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(KEYWORDS_DATABASE)) {
    const found: string[] = [];

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      const escaped = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[\\s,;.!?()\\[\\]{}'"/-])${escaped}(?:[\\s,;.!?()\\[\\]{}'"/-]|$)`, 'i');

      if (regex.test(textLower) || textLower.includes(keywordLower)) {
        found.push(keyword);
      }
    }

    if (found.length > 0) {
      result[category] = found;
    }
  }

  return result;
}

// Stats pour debug
console.log(`📚 Keywords database loaded: ${ALL_KEYWORDS.length} keywords in ${Object.keys(KEYWORDS_DATABASE).length} categories`);
