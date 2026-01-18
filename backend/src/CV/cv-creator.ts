import * as fs from 'fs';
import PDFDocument from 'pdfkit';

// --- INTERFACES ---

export interface CVHeader {
    name: string;
    title: string;
    contact: string;
}

export interface CVExperience {
    title: string;
    company: string;
    location: string;
    dates: string;
    description: string;
    tasks: string[];
}

export interface CVEducation {
    degree: string;
    school: string;
    year: string;
}

export interface CVData {
    header: CVHeader;
    summary: string;
    experience: CVExperience[];
    education: CVEducation[];
    skills: Record<string, string[]>;
}

// --- PDF GENERATOR CLASS ---

export class ModernATS_CVGenerator {
    private doc: PDFKit.PDFDocument;
    private writeStream: fs.WriteStream;
    private filename: string;

    // Colors
    private primaryColor = '#2C3E50';
    private accentColor = '#34495E';
    private greyColor = '#808080';

    // Margins and Dimensions
    private marginX = 60; // Increased for better breathing room
    private marginY = 50;
    private contentWidth = 595.28 - 120; // A4 Width (595.28) - 2*marginX

    constructor(filename: string) {
        this.filename = filename;
        this.doc = new PDFDocument({
            size: 'A4',
            margin: this.marginY, // Vertical margin
            autoFirstPage: true
        });

        // Set left and right margins specifically if needed, 
        // but PDFDocument 'margin' usually applies to all. 
        // We'll use marginX for our internal calculations.

        this.writeStream = fs.createWriteStream(filename);
        this.doc.pipe(this.writeStream);
    }

    /**
     * Main method to generate the PDF from the provided data.
     */
    public async generate(data: CVData): Promise<void> {
        this.addHeader(data.header.name, data.header.title, data.header.contact);

        if (data.summary) {
            this.addSectionTitle("Profil");
            this.doc.font('Helvetica').fontSize(10.5).text(data.summary, { align: 'justify', lineGap: 2 });
            this.doc.moveDown(1.5);
        }

        if (data.experience && data.experience.length > 0) {
            this.addSectionTitle("Expérience Professionnelle");
            data.experience.forEach((exp, index) => {
                this.addExperience(exp);
                if (index < data.experience.length - 1) this.doc.moveDown(1);
            });
            this.doc.moveDown(1);
        }

        if (data.education && data.education.length > 0) {
            this.addSectionTitle("Formation");
            data.education.forEach((edu, index) => {
                this.addEducation(edu);
                if (index < data.education.length - 1) this.doc.moveDown(0.8);
            });
            this.doc.moveDown(1);
        }

        if (data.skills) {
            this.addSectionTitle("Compétences");
            this.addSkillsGrid(data.skills);
        }

        return this.build();
    }

    private addHeader(name: string, title: string, contactInfo: string): void {
        this.doc.x = this.marginX;
        // Name
        this.doc
            .font('Helvetica-Bold')
            .fontSize(28)
            .fillColor(this.primaryColor)
            .text(name, { align: 'left' })
            .moveDown(0.1);

        // Title
        this.doc
            .font('Helvetica-Bold')
            .fontSize(16)
            .fillColor(this.accentColor)
            .text(title, { align: 'left' })
            .moveDown(0.4);

        // Contact
        this.doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor('black')
            .text(contactInfo, { align: 'left' })
            .moveDown(0.8);

        // HR
        this.drawHR(1.5, '#EEEEEE');
        this.doc.moveDown(1.2);
    }

    private addSectionTitle(title: string): void {
        this.doc.x = this.marginX;
        this.doc.moveDown(0.5);
        this.doc
            .font('Helvetica-Bold')
            .fontSize(13)
            .fillColor(this.primaryColor)
            .text(title.toUpperCase(), { align: 'left', characterSpacing: 1 });
        
        this.drawHR(0.8, this.primaryColor);
        this.doc.moveDown(0.6);
    }

    private addExperience(exp: CVExperience): void {
        this.doc.x = this.marginX;
        const currentY = this.doc.y;

        // Line 1: Title (Left) | Dates (Right)
        this.doc
            .font('Helvetica-Bold')
            .fontSize(11.5)
            .fillColor('black')
            .text(exp.title, this.marginX, currentY, { width: this.contentWidth * 0.7, continued: false });

        this.doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor(this.greyColor)
            .text(exp.dates, this.marginX, currentY, { align: 'right', width: this.contentWidth });

        // Line 2: Company (Left) | Location (Right)
        const nextY = this.doc.y + 2;
        this.doc
            .font('Helvetica-Oblique')
            .fontSize(10.5)
            .fillColor(this.accentColor)
            .text(exp.company, this.marginX, nextY, { width: this.contentWidth * 0.7 });
        
        this.doc.text(exp.location, this.marginX, nextY, { align: 'right', width: this.contentWidth });

        this.doc.moveDown(0.75);

        // Description
        if (exp.description) {
            this.doc
                .font('Helvetica')
                .fontSize(10)
                .fillColor('black')
                .text(exp.description, { align: 'justify', lineGap: 1.5 })
                .moveDown(0.4);
        }

        // Tasks
        if (exp.tasks && exp.tasks.length > 0) {
            exp.tasks.forEach(task => {
                this.doc
                    .fontSize(9.5)
                    .text('• ' + task, { indent: 12, align: 'justify', lineGap: 1 });
            });
        }
    }

    private addEducation(edu: CVEducation): void {
        this.doc.x = this.marginX;
        const currentY = this.doc.y;

        // Degree | Year
        this.doc
            .font('Helvetica-Bold')
            .fontSize(11)
            .fillColor('black')
            .text(edu.degree, this.marginX, currentY, { width: this.contentWidth * 0.7 });

        this.doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor(this.greyColor)
            .text(edu.year, this.marginX, currentY, { align: 'right', width: this.contentWidth });

        // School
        this.doc
            .font('Helvetica-Oblique')
            .fontSize(10)
            .fillColor(this.accentColor)
            .text(edu.school);
    }

    private addSkillsGrid(categories: Record<string, string[]>): void {
        this.doc.x = this.marginX;
        this.doc.font('Helvetica').fontSize(10).fillColor('black');
        
        for (const [category, items] of Object.entries(categories)) {
            this.doc.font('Helvetica-Bold').text(`${category}: `, { continued: true });
            this.doc.font('Helvetica').text(items.join(', '), { lineGap: 2 });
        }
    }

    private build(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.writeStream.on('finish', () => {
                console.log(`✅ PDF generated successfully: ${this.filename}`);
                resolve();
            });
            this.writeStream.on('error', reject);
            this.doc.end();
        });
    }

    private drawHR(thickness: number, color: string): void {
        const y = this.doc.y + 2;
        this.doc
            .save()
            .moveTo(this.marginX, y)
            .lineTo(this.marginX + this.contentWidth, y)
            .lineWidth(thickness)
            .strokeColor(color)
            .stroke()
            .restore();
        
        this.doc.y = y + 5; 
    }
}

// --- MAIN TEST FUNCTION ---

async function main() {
    // Sample CV data for testing
    const sampleCVData: CVData = {
        header: {
            name: "Jean Dupont",
            title: "Développeur Full Stack Senior",
            contact: "jean.dupont@email.com | +33 6 12 34 56 78 | Paris, France | linkedin.com/in/jeandupont"
        },
        summary: "Développeur Full Stack passionné avec plus de 5 ans d'expérience dans la conception et le développement d'applications web modernes. Expert en JavaScript/TypeScript, React, Node.js et bases de données SQL/NoSQL. Capacité démontrée à livrer des solutions innovantes dans des environnements agiles.",
        experience: [
            {
                title: "Développeur Full Stack Senior",
                company: "TechCorp Solutions",
                location: "Paris, France",
                dates: "Jan 2021 - Présent",
                description: "Lead technique sur plusieurs projets d'applications web critiques pour des clients du CAC40.",
                tasks: [
                    "Développement d'une plateforme e-commerce générant 2M€ de CA annuel avec React et Node.js",
                    "Migration d'une application legacy vers une architecture microservices, réduisant les coûts de 40%",
                    "Mentorat de 3 développeurs juniors et mise en place de standards de code",
                    "Optimisation des performances applicatives, réduction du temps de chargement de 60%"
                ]
            },
            {
                title: "Développeur Full Stack",
                company: "StartupLab",
                location: "Lyon, France",
                dates: "Mar 2019 - Déc 2020",
                description: "Membre de l'équipe core développant une solution SaaS B2B dans le domaine de la logistique.",
                tasks: [
                    "Développement de features end-to-end avec React, Express et PostgreSQL",
                    "Implémentation de tests automatisés (Jest, Cypress) augmentant la couverture à 85%",
                    "Participation aux choix d'architecture et revues de code",
                    "Intégration de services tiers (Stripe, SendGrid, AWS S3)"
                ]
            },
            {
                title: "Développeur Web Junior",
                company: "Digital Agency",
                location: "Bordeaux, France",
                dates: "Sep 2017 - Fév 2019",
                description: "Développement de sites web et applications pour divers clients.",
                tasks: [
                    "Création de sites web responsive avec HTML5, CSS3, JavaScript",
                    "Développement de thèmes WordPress personnalisés",
                    "Maintenance et évolution d'applications existantes",
                    "Collaboration directe avec designers et chefs de projet"
                ]
            }
        ],
        education: [
            {
                degree: "Master en Informatique - Spécialité Développement Web",
                school: "Université Paris-Saclay",
                year: "2017"
            },
            {
                degree: "Licence en Informatique",
                school: "Université de Bordeaux",
                year: "2015"
            }
        ],
        skills: {
            "Langages": ["JavaScript", "TypeScript", "Python", "SQL", "HTML5", "CSS3"],
            "Frontend": ["React", "Vue.js", "Next.js", "Redux", "TailwindCSS", "Material-UI"],
            "Backend": ["Node.js", "Express", "NestJS", "Django", "REST APIs", "GraphQL"],
            "Bases de données": ["PostgreSQL", "MongoDB", "Redis", "MySQL"],
            "DevOps & Outils": ["Git", "Docker", "AWS", "CI/CD", "Jest", "Webpack"],
            "Méthodologies": ["Agile/Scrum", "TDD", "Code Review", "Design Patterns"]
        }
    };

    console.log("🚀 Starting CV generation test...\n");

    try {
        const generator = new ModernATS_CVGenerator("test-output-cv.pdf");
        await generator.generate(sampleCVData);
        console.log("\n✨ Test completed successfully!");
        console.log("📄 Check the generated file: test-output-cv.pdf");
    } catch (error) {
        console.error("❌ Error generating CV:", error);
        throw error;
    }
}

// Export the main function for testing
export { main };
