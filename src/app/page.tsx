import { Footer } from '@/components/layout/Footer';
import { AcademicSection } from '@/components/sections/AcademicSection';
import { AccountLinksSection } from '@/components/sections/AccountLinksSection';
import { ActivitiesSection } from '@/components/sections/ActivitiesSection';
import { ProfileSection } from '@/components/sections/ProfileSection';
import { SkillStackSection } from '@/components/sections/SkillStackSection';
import { WorksSection } from '@/components/sections/WorksSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 font-mono p-6 md:p-20 selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto space-y-32">
        <ProfileSection />
        <AccountLinksSection />
        <SkillStackSection />
        <WorksSection />
        <ActivitiesSection />
        <AcademicSection />
        <Footer />
      </div>
    </main>
  );
}
