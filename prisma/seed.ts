import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@neo-gruv.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('⚠️ WARNING: Using default password "admin123". Please set ADMIN_PASSWORD in your .env file.');
  }

  const hashedPassword = await argon2.hash(adminPassword);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
    },
  });
  console.log('Admin user created:', admin.email);

  // 2. Clear existing data
  await prisma.project.deleteMany();
  await prisma.experienceSkill.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.skill.deleteMany();

  // 3. Seed Projects
  const projectsData = [
    {
      title: 'Neon Void',
      brief: 'A sensory overload experience for a conceptual fashion brand.',
      description: 'A sensory overload experience for a conceptual fashion brand. We built a fully immersive 3D web experience with WebGL and React Three Fiber to push the boundaries of digital fashion presentation.',
      tags: ['Web Design', '3D'],
      liveUrl: '#',
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk38x1K-p1rd39Gqw2ZsvVL0bovJzUtBUCG95EL5mJlX74UGwM-pE_87Txodc3enAWdvWEWJw-l-fohl70cXtOTWVx8uYx1fTlHsTk-Aqga76Gk-gTSgZLEwNTK7WVTsPxKjRFHM11SvEoJJTdDJc12CnYPzS_PqpF1_m0Ihw5o-ydjRO57fbEZrWs-5qYf88Em1EQEtsuA6i3Og7JtqZ_HQO9AMjn9oFFRjV8E-Frk0u0AU4no0EcMX9cA4hae6HupwlUu36k-cw',
      featured: true,
      order: 1,
    },
    {
      title: 'Rust & Bone',
      brief: 'Branding and visual identity for a brutalist architecture firm.',
      description: 'Branding and visual identity for a brutalist architecture firm. The project involved creating a robust typography system, concrete-inspired color palettes, and a minimalist web presence that reflects their architectural philosophy.',
      tags: ['Branding', 'Identity'],
      liveUrl: '#',
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8KpkD47eIsZ1nMkk61RbsL0iaKin_PNtkG9F1PQUgY70a7C7Rnsue6orE9DAf-V5lJiKHnns7q6YWYtqY5gIN-sr0p3kX8eBIL0FfZRNPEkluvvFs8ulQ51Vc5wQy0hdEhctSsgWLtJy9wSqIAI-XYSbNCjc2rtoBPA7ewza2ViUAoysprfiTVOOkhtv-0DL_dNhMhLrom9wAAk567EE6NXuqYkgwGBD3i3XFrs4VHkGvc4qt6Zy3o2Qs-FEhHKc1NP16rPvisIY',
      featured: false,
      order: 2,
    },
    {
      title: 'Vortex Lab',
      brief: 'An interactive data dashboard with real-time 3D visualizations.',
      description: 'An interactive data dashboard with real-time 3D visualizations. Designed for complex data analysis, this platform leverages web technologies to present high-density data streams in an intuitive and visually striking interface.',
      tags: ['Dashboard', 'WebGL'],
      liveUrl: '#',
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk38x1K-p1rd39Gqw2ZsvVL0bovJzUtBUCG95EL5mJlX74UGwM-pE_87Txodc3enAWdvWEWJw-l-fohl70cXtOTWVx8uYx1fTlHsTk-Aqga76Gk-gTSgZLEwNTK7WVTsPxKjRFHM11SvEoJJTdDJc12CnYPzS_PqpF1_m0Ihw5o-ydjRO57fbEZrWs-5qYf88Em1EQEtsuA6i3Og7JtqZ_HQO9AMjn9oFFRjV8E-Frk0u0AU4no0EcMX9cA4hae6HupwlUu36k-cw',
      featured: false,
      order: 3,
    },
  ];

  for (const p of projectsData) {
    await prisma.project.create({
      data: p
    });
  }
  console.log('Projects seeded.');

  // 4. Seed Experiences
  const experiencesData = [
    {
      role: 'Lead Frontend Engineer',
      company: 'Neo-Impact Studio',
      period: '2023 - PRESENT',
      description: 'Spearheaded the development of high-performance web applications using React and WebGL. Established a robust design system based on neo-brutalist principles that increased user engagement by 40%.',
      skills: ['React', 'WebGL', 'TailwindCSS', 'TypeScript'],
    },
    {
      role: 'Senior UI Developer',
      company: 'Digital Void',
      period: '2020 - 2023',
      description: 'Architected scalable frontend solutions for enterprise clients. Mentored junior developers and introduced modern tooling like Vite and Vitest to reduce build times and improve code quality.',
      skills: ['Vue', 'CSS Architecture', 'Vite', 'Figma'],
    },
    {
      role: 'Frontend Web Developer',
      company: 'Creative Syntax',
      period: '2017 - 2020',
      description: 'Developed responsive, accessible, and fast-loading websites for boutique agencies. Specialized in custom CSS animations and micro-interactions.',
      skills: ['HTML5', 'SASS', 'JavaScript', 'GSAP'],
    },
  ];

  for (const e of experiencesData) {
    const { skills, ...rest } = e;
    await prisma.experience.create({
      data: {
        ...rest,
        skills: { create: skills.map(s => ({ name: s })) }
      }
    });
  }
  console.log('Experiences seeded.');

  // 5. Seed Skills
  const skillsData = [
    { name: 'REACT', color: 'bg-surface', text: 'text-on-surface', delay: '0.1s', dur: '6.5s', rotate: 'rotate-2', mt: '' },
    { name: 'TAILWIND', color: 'bg-theme-yellow', text: 'text-on-surface', delay: '0.8s', dur: '5.8s', rotate: '-rotate-3', mt: 'mt-4 md:mt-12' },
    { name: 'FIGMA', color: 'bg-theme-green', text: 'text-on-surface', delay: '1.5s', dur: '6.2s', rotate: 'rotate-6', mt: '' },
    { name: 'THREE.JS', color: 'bg-theme-red', text: 'text-surface-container-lowest', delay: '0.4s', dur: '7s', rotate: '-rotate-2', mt: 'mt-4 md:mt-12' },
    { name: 'NODE', color: 'bg-on-surface', text: 'text-theme-blue', delay: '2.1s', dur: '5.5s', rotate: '-rotate-1', mt: 'mt-4 md:mt-0' },
    { name: 'GSAP', color: 'bg-surface', text: 'text-on-surface', delay: '1.2s', dur: '6.8s', rotate: 'rotate-3', mt: 'mt-4 md:mt-12' },
    { name: 'WEBGL', color: 'bg-theme-yellow', text: 'text-on-surface', delay: '0.7s', dur: '6.1s', rotate: '-rotate-6', mt: 'mt-4 md:mt-0' },
    { name: 'CSS', color: 'bg-surface', text: 'text-on-surface', delay: '1.9s', dur: '5.9s', rotate: 'rotate-1', mt: 'mt-4 md:mt-12' },
  ];

  for (const s of skillsData) {
    await prisma.skill.create({ data: s });
  }
  console.log('Skills seeded.');

  // 6. Seed SiteConfigs
  const siteConfigs = [
    {
      key: 'hero',
      value: JSON.stringify({
        headline: { line1: 'DISRUPTING', line2: 'THE DIGITAL', highlight: 'SPACE' },
        tagline: 'We build high-impact, raw, and unapologetic digital experiences for brands that refuse to blend in.',
        ctaText: 'VIEW OUR WORK',
        ctaHref: '#work',
        heroImage: {
          src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8KpkD47eIsZ1nMkk61RbsL0iaKin_PNtkG9F1PQUgY70a7C7Rnsue6orE9DAf-V5lJiKHnns7q6YWYtqY5gIN-sr0p3kX8eBIL0FfZRNPEkluvvFs8ulQ51Vc5wQy0hdEhctSsgWLtJy9wSqIAI-XYSbNCjc2rtoBPA7ewza2ViUAoysprfiTVOOkhtv-0DL_dNhMhLrom9wAAk567EE6NXuqYkgwGBD3i3XFrs4VHkGvc4qt6Zy3o2Qs-FEhHKc1NP16rPvisIY',
          alt: 'Hero graphic abstract'
        }
      })
    },
    {
      key: 'about',
      value: JSON.stringify({
        badge: 'Manifesto',
        portraitLabel: 'CREATOR. DESTROYER.',
        portraitPlaceholder: '[PORTRAIT]',
        groupImagePlaceholder: '[GROUP IMAGE]',
        headline: { line1: 'WE ARE', line2: 'CREATIVE', highlight: 'REBELS' },
        manifesto: 'The web has become boring. Everything looks the same. Soft shadows, rounded corners, safe colors. We reject the generic. We build with hard lines, loud colors, and intentional friction.',
        rules: [
          { label: 'Rule 01', text: 'Function follows form. Make it scream before it speaks.' },
          { label: 'Rule 02', text: "Contrast is king. If it doesn't pop, it's dead." }
        ]
      })
    },
    {
      key: 'contact',
      value: JSON.stringify({
        headline: { line1: 'READY TO CAUSE', line2: 'SOME', highlight: 'TROUBLE?' },
        subtitle: "Drop us a line. We don't bite hard unless requested.",
        form: { namePlaceholder: 'YOUR DESIGNATION (NAME)', emailPlaceholder: 'COMMUNICATION CHANNEL (EMAIL)', messagePlaceholder: 'YOUR DIRECTIVE (MESSAGE)', submitText: 'SEND TRANSMISSION' },
        emailDestination: 'mailto:hello@creative.raw'
      })
    },
    {
      key: 'marquee',
      value: JSON.stringify([
        '* BOLD DESIGN *',
        'UNAPOLOGETIC UX *',
        'NEO-BRUTALISM *',
        'HIGH IMPACT *'
      ])
    },
    {
      key: 'navigation',
      value: JSON.stringify({
        brandName: 'CREATIVE.RAW',
        navLinks: [
          { label: 'About', href: '#about' },
          { label: 'Work', href: '#work' },
          { label: 'Experience', href: '#experience' },
          { label: 'Skills', href: '#skills' },
          { label: 'Resume', href: '#resume' }
        ],
        ctaText: "LET'S TALK"
      })
    },
    {
      key: 'footer',
      value: JSON.stringify({
        brandName: 'CREATIVE.RAW',
        socials: [
          { label: 'Instagram', href: '#', hoverColor: 'hover:text-theme-red', hoverBorder: 'hover:border-theme-red' },
          { label: 'Behance', href: '#', hoverColor: 'hover:text-theme-blue', hoverBorder: 'hover:border-theme-blue' },
          { label: 'Dribbble', href: '#', hoverColor: 'hover:text-theme-green', hoverBorder: 'hover:border-theme-green' },
          { label: 'Email', href: '#', hoverColor: 'hover:text-theme-yellow', hoverBorder: 'hover:border-theme-yellow' }
        ],
        copyright: '©2024 NEO-IMPACT STUDIO. BUILT FOR DISRUPTORS.'
      })
    },
    {
      key: 'resume',
      value: JSON.stringify({
        versionLabel: 'LATEST VERSION v2.4',
        headline: { prefix: 'ACQUIRE', highlight: 'DATA' },
        ctaText: 'RESUME',
        downloadUrl: '#'
      })
    }
  ];

  await prisma.siteConfig.deleteMany();
  for (const c of siteConfigs) {
    await prisma.siteConfig.create({ data: c });
  }
  console.log('Site Configs seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
