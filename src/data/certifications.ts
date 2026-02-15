import { certifications as veliteCertifications } from '#site/content';

export interface Certification {
  name: string;
}

export const certifications: Certification[] = veliteCertifications.certifications;

