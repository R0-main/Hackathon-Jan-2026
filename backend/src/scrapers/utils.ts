export function extractExperienceLevelFromText(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('senior') || lower.includes('confirmé')) return 'Senior';
    if (lower.includes('junior') || lower.includes('débutant')) return 'Junior';
    if (lower.includes('intermédiaire')) return 'Intermédiaire';
    if (lower.includes('lead')) return 'Lead';
    if (lower.includes('stage')) return 'Stage';
    return 'Non spécifié';
}

export function extractEmploymentTypeFromText(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('cdi') || lower.includes('temps plein')) return 'CDI';
    if (lower.includes('cdd')) return 'CDD';
    if (lower.includes('freelance')) return 'Freelance';
    if (lower.includes('stage')) return 'Stage';
    if (lower.includes('alternance')) return 'Alternance';
    return 'Non spécifié';
}

export function extractRequirements(text: string): string[] {
    const requirements: string[] = [];
    const lines = text.split('\n');
    let inSection = false;
    
    for (const line of lines) {
        const trimmed = line.trim();
        const lower = trimmed.toLowerCase();
        
        if (lower.includes('exigences') || lower.includes('profil')) {
            inSection = true;
            continue;
        }
        
        if (inSection && trimmed.match(/^[•\-\*\d.]/)) {
            const cleaned = trimmed.replace(/^[•\-\*\d.]\s*/, '').trim();
            if (cleaned.length > 10) requirements.push(cleaned);
        }
        
        if (lower.includes('avantages')) inSection = false;
    }
    
    return requirements.slice(0, 15);
}

export function extractSkills(text: string): string[] {
    const skills = [
        'JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'Docker',
        'AWS', 'PostgreSQL', 'Git', 'Agile', 'Leadership', 'Anglais',
    ];
    
    return skills.filter(s => text.toLowerCase().includes(s.toLowerCase()));
}

export function jobToText(job: any): string {
    return `
OFFRE: ${job.title}
ENTREPRISE: ${job.company}
LOCALISATION: ${job.location}
${job.salary ? `SALAIRE: ${job.salary}` : ''}

COMPÉTENCES: ${job.skills.join(', ')}
EXIGENCES: ${job.requirements.map((r: string) => `- ${r}`).join('\n')}

DESCRIPTION:
${job.description}
    `.trim();
}