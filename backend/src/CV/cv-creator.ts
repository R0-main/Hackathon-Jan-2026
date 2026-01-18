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
    private writeStream?: fs.WriteStream;
    private filename?: string;
    private buffers: Buffer[] = [];

    // Colors
    private primaryColor = '#2C3E50';
    private accentColor = '#34495E';
    private greyColor = '#808080';

    // Margins and Dimensions
    private marginX = 60; // Increased for better breathing room
    private marginY = 50;
    private contentWidth = 595.28 - 120; // A4 Width (595.28) - 2*marginX

    constructor(filename?: string) {
        this.filename = filename;
        this.doc = new PDFDocument({
            size: 'A4',
            margin: this.marginY, // Vertical margin
            autoFirstPage: true
        });

        if (filename) {
            this.writeStream = fs.createWriteStream(filename);
            this.doc.pipe(this.writeStream);
        }

        // Collect buffers
        this.doc.on('data', this.buffers.push.bind(this.buffers));
    }

    /**
     * Main method to generate the PDF from the provided data.
     */
    public async generate(data: CVData): Promise<Buffer> {
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

        // Title + Dates on same line (simple inline format)
        this.doc
            .font('Helvetica-Bold')
            .fontSize(11.5)
            .fillColor('black')
            .text(exp.title, { continued: true })
            .font('Helvetica')
            .fontSize(10)
            .fillColor(this.greyColor)
            .text(`  —  ${exp.dates}`, { align: 'left' });

        // Company + Location on same line
        const locationText = exp.location ? `, ${exp.location}` : '';
        this.doc
            .font('Helvetica-Oblique')
            .fontSize(10.5)
            .fillColor(this.accentColor)
            .text(`${exp.company}${locationText}`)
            .moveDown(0.5);

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

        // Degree + Year on same line (simple inline format)
        this.doc
            .font('Helvetica-Bold')
            .fontSize(11)
            .fillColor('black')
            .text(edu.degree, { continued: true })
            .font('Helvetica')
            .fontSize(10)
            .fillColor(this.greyColor)
            .text(`  —  ${edu.year}`, { align: 'left' });

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

    private build(): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            this.doc.on('end', () => {
                const pdfBuffer = Buffer.concat(this.buffers);
                resolve(pdfBuffer);
            });

            this.doc.on('error', reject);

            // If we are writing to a file, we also want to wait for that to finish
            // but the 'end' event on doc is sufficient for the buffer.
            if (this.writeStream) {
                this.writeStream.on('finish', () => {
                    console.log(`✅ PDF generated successfully: ${this.filename}`);
                });
                this.writeStream.on('error', (err) => {
                    console.error('Error writing PDF file:', err);
                });
            }
            
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
