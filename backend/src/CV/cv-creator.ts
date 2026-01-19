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
    private marginX = 60;
    private marginY = 50;
    private contentWidth = 595.28 - 120; // A4 Width (595.28) - 2*marginX

    // Spacing constants (design system)
    private spaceSm = 0.3;
    private spaceMd = 0.6;
    private spaceLg = 1.0;

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
            this.ensureSpace(80); // Section title + summary text
            this.addSectionTitle("Profil");
            this.doc.font('Helvetica').fontSize(10.5).text(data.summary, { align: 'left', lineGap: 2 });
            this.doc.moveDown(this.spaceLg);
        }

        if (data.experience && data.experience.length > 0) {
            this.ensureSpace(100); // Section title + at least one experience header
            this.addSectionTitle("Expérience Professionnelle");
            data.experience.forEach((exp, index) => {
                this.ensureSpace(80); // Prevent orphan experience titles
                this.addExperience(exp);
                if (index < data.experience.length - 1) this.doc.moveDown(this.spaceLg);
            });
            this.doc.moveDown(this.spaceLg);
        }

        if (data.education && data.education.length > 0) {
            this.ensureSpace(80); // Section title + at least one education entry
            this.addSectionTitle("Formation");
            data.education.forEach((edu, index) => {
                this.ensureSpace(50); // Prevent orphan education titles
                this.addEducation(edu);
                if (index < data.education.length - 1) this.doc.moveDown(this.spaceMd);
            });
            this.doc.moveDown(this.spaceLg);
        }

        if (data.skills) {
            this.ensureSpace(60); // Section title + at least one skill row
            this.addSectionTitle("Compétences");
            this.addSkillsGrid(data.skills);
        }

        return this.build();
    }

    private addHeader(name: string, title: string, contactInfo: string): void {
        this.doc.x = this.marginX;

        // Name - larger, bolder (reduced characterSpacing for ATS compatibility)
        this.doc
            .font('Helvetica-Bold')
            .fontSize(26)
            .fillColor(this.primaryColor)
            .text(name.toUpperCase(), { align: 'left', characterSpacing: 0.8 })
            .moveDown(0.2);

        // Title - accent color
        this.doc
            .font('Helvetica')
            .fontSize(14)
            .fillColor(this.accentColor)
            .text(title, { align: 'left' })
            .moveDown(this.spaceMd);

        // Contact - formatted with separators, normalize whitespace
        const contactFormatted = contactInfo
            .split(/[,\n]/)
            .map(s => s.trim().replace(/\s+/g, ' '))
            .filter(s => s.length > 0)
            .join('  •  ');

        this.doc
            .font('Helvetica')
            .fontSize(9.5)
            .fillColor('#666666')
            .text(contactFormatted, {
                align: 'left',
                width: this.contentWidth,  // Constrain to content area
                lineGap: 2                 // Clean spacing if wraps
            })
            .moveDown(this.spaceMd);

        // Accent line (thin, colored)
        this.drawHR(1.2, this.primaryColor);
        this.doc.moveDown(1);
    }

    private addSectionTitle(title: string): void {
        this.doc.x = this.marginX;
        this.doc.moveDown(this.spaceMd);
        this.doc
            .font('Helvetica-Bold')
            .fontSize(13)
            .fillColor(this.primaryColor)
            .text(title.toUpperCase(), { align: 'left', characterSpacing: 1 });

        this.drawHR(0.8, this.primaryColor);
        this.doc.moveDown(this.spaceMd);
    }

    private addExperience(exp: CVExperience): void {
        this.doc.x = this.marginX;
        const lineY = this.doc.y;
        const titleMaxWidth = this.contentWidth * 0.75; // Leave space for dates

        // Calculate title height for proper positioning
        this.doc.font('Helvetica-Bold').fontSize(11);
        const titleHeight = this.doc.heightOfString(exp.title, { width: titleMaxWidth });

        // Title on left
        this.doc
            .fillColor('black')
            .text(exp.title, this.marginX, lineY, { width: titleMaxWidth });

        // Dates on right (same line, aligned right)
        this.doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor(this.greyColor)
            .text(exp.dates, this.marginX, lineY, { width: this.contentWidth, align: 'right' });

        // Reset Y position after the title line (use calculated height)
        this.doc.y = lineY + Math.max(titleHeight, 14) + 2;
        this.doc.x = this.marginX;

        // Company + Location
        const locationText = exp.location ? `  •  ${exp.location}` : '';
        this.doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor(this.accentColor)
            .text(`${exp.company}${locationText}`)
            .moveDown(this.spaceSm);

        // Description
        if (exp.description) {
            this.doc
                .font('Helvetica')
                .fontSize(10)
                .fillColor('#333333')
                .text(exp.description, { align: 'left', lineGap: 1.5 })
                .moveDown(this.spaceSm);
        }

        // Tasks with proper bullet alignment
        if (exp.tasks && exp.tasks.length > 0) {
            const bulletX = this.marginX + 8;
            const textX = this.marginX + 20;
            const textWidth = this.contentWidth - 20;

            exp.tasks.forEach(task => {
                const taskY = this.doc.y;
                // Bullet point
                this.doc
                    .fontSize(10)
                    .fillColor(this.accentColor)
                    .text('•', bulletX, taskY, { continued: false });
                // Task text
                this.doc
                    .fontSize(9.5)
                    .fillColor('#444444')
                    .text(task, textX, taskY, { width: textWidth, align: 'left', lineGap: 1 });
            });
        }
    }

    private addEducation(edu: CVEducation): void {
        this.doc.x = this.marginX;
        const lineY = this.doc.y;
        const degreeMaxWidth = this.contentWidth * 0.75; // Leave space for year

        // Calculate degree height for proper positioning
        this.doc.font('Helvetica-Bold').fontSize(11);
        const degreeHeight = this.doc.heightOfString(edu.degree, { width: degreeMaxWidth });

        // Degree on left
        this.doc
            .fillColor('black')
            .text(edu.degree, this.marginX, lineY, { width: degreeMaxWidth });

        // Year on right (same line, aligned right)
        this.doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor(this.greyColor)
            .text(edu.year, this.marginX, lineY, { width: this.contentWidth, align: 'right' });

        // Reset Y position (use calculated height)
        this.doc.y = lineY + Math.max(degreeHeight, 14) + 2;
        this.doc.x = this.marginX;

        // School
        this.doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor(this.accentColor)
            .text(edu.school);
    }

    private addSkillsGrid(categories: Record<string, string[]>): void {
        this.doc.x = this.marginX;
        const labelWidth = 130; // Fixed width for category labels (fits ~12 chars)
        const skillsWidth = this.contentWidth - labelWidth - 10;

        // Sort categories in canonical order for consistent rendering
        const categoryOrder = ['Langages', 'Frameworks', 'Outils', 'Langues', 'Autres'];
        const entries = Object.entries(categories).sort(([a], [b]) => {
            const indexA = categoryOrder.indexOf(a);
            const indexB = categoryOrder.indexOf(b);
            // Unknown categories go last, in original order
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
        entries.forEach(([category, items], index) => {
            const rowY = this.doc.y;

            // Category name (fixed width column)
            this.doc
                .font('Helvetica-Bold')
                .fontSize(10)
                .fillColor(this.primaryColor)
                .text(category, this.marginX, rowY, { width: labelWidth });

            // Skills (aligned after label, wraps properly)
            this.doc
                .font('Helvetica')
                .fontSize(10)
                .fillColor('#444444')
                .text(items.join('  •  '), this.marginX + labelWidth, rowY, {
                    width: skillsWidth,
                    align: 'left',
                    lineGap: 2
                });

            // Add spacing between categories (except last)
            if (index < entries.length - 1) {
                this.doc.moveDown(this.spaceMd);
            }
        });
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

    /**
     * Ensures there's enough space on the current page.
     * If not, adds a new page to prevent orphan titles/content.
     */
    private ensureSpace(minHeight: number): void {
        const page = this.doc.page;
        const remainingSpace = page.height - page.margins.bottom - this.doc.y;
        if (remainingSpace < minHeight) {
            this.doc.addPage();
            this.doc.y = page.margins.top;
            this.doc.x = this.marginX;
        }
    }
}
