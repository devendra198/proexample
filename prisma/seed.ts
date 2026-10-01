import { PrismaClient, Status, ProjectStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // 1. Seed Admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@pro-example.com";
  const adminPassword = process.env.ADMIN_PASSWORD;

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    if (!adminPassword) {
      console.warn("⚠️ ADMIN_PASSWORD not set in environment. Skipping admin creation.");
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await prisma.admin.create({
        data: {
          name: "Admin User",
          email: adminEmail,
          passwordHash,
        },
      });
      console.log(`Created admin user: ${adminEmail}`);
    }
  } else if (adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.update({
      where: { email: adminEmail },
      data: { passwordHash },
    });
    console.log(`Updated admin user password for: ${adminEmail}`);
  } else {
    console.log(`Admin user ${adminEmail} already exists (skipping password update, set ADMIN_PASSWORD to change)`);
  }

  // 2. Developer Portfolios
  const devPortfolios = [
    {
      "name": "Jeet",
      "url": "https://jeetofficial.in/",
      "role": "Full-Stack Developer",
      "sortOrder": 1
    },
    {
      "name": "Krishan",
      "url": "https://krishanofficial.in/",
      "role": "Frontend & UI Developer",
      "sortOrder": 2
    },
    {
      "name": "Kahan Singh",
      "url": "https://kahansingh.in/",
      "role": "Full-Stack & CMS Developer",
      "sortOrder": 3
    },
    {
      "name": "Adarsh",
      "url": "https://adarshofficial.in/",
      "role": "Web & Mobile Developer",
      "sortOrder": 4
    },
    {
      "name": "Devendra Singh",
      "url": "https://devendrasingh.co.in/",
      "role": "Software Engineer",
      "sortOrder": 5
    }
  ];

  for (const dev of devPortfolios) {
    const existing = await prisma.developerPortfolio.findFirst({
      where: { url: dev.url }
    });
    if (!existing) {
      await prisma.developerPortfolio.create({ data: dev });
    }
  }
  console.log("Seeded developer portfolios");

  // 3. Categories, Technologies, and Projects
  const categoriesData = [
    {
      "name": "Web Design",
      "slug": "web-design",
      "description": "Custom CMS websites, themes, and eCommerce stores.",
      "sortOrder": 1,
      "status": "ACTIVE",
      "technologies": [
        {
          "name": "WordPress",
          "slug": "wordpress",
          "description": "WordPress themes, custom plugins, and WooCommerce.",
          "sortOrder": 1,
          "status": "ACTIVE",
          "projects": [
            {
              "name": "clubfitnation",
              "slug": "clubfitnation-xahh-gyqm",
              "shortDescription": "clubfitnation",
              "description": "clubfitnation",
              "projectUrl": "https://clubfitnation.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 0,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Olga Roberts Studio",
              "slug": "olga-roberts-studio",
              "shortDescription": "Creative photography and design portfolio.",
              "description": "Custom design showcase.",
              "projectUrl": "https://www.olgarobertsstudio.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 2,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "One Biological Beauty",
              "slug": "one-biological-beauty",
              "shortDescription": "Organic cosmetics and skincare store.",
              "description": "Custom skincare brand portal.",
              "projectUrl": "https://onebiologicalbeauty.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 3,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Coral Estate Sales",
              "slug": "coral-estate-sales",
              "shortDescription": "A clean and modern WordPress website for an estate sales business.",
              "description": "A comprehensive estate sales website built on WordPress featuring custom listings, high-resolution photo galleries, upcoming auction schedules, integrated Google Maps directions, and an automated customer inquiry contact system.",
              "projectUrl": "https://coralestatesales.com",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 7,
              "status": "ACTIVE",
              "links": []
            }
          ]
        },
        {
          "name": "WordPress Gutenberg",
          "slug": "wordpress-gutenberg",
          "description": null,
          "sortOrder": 1,
          "status": "ACTIVE",
          "projects": [
            {
              "name": "Fantassin – Renegade Web Makers",
              "slug": "fantassin-renegade-web-makers",
              "shortDescription": "Agence WordPress créative à Lyon avec Gutenberg.",
              "description": "Agence WordPress créative à Lyon. Graphisme, UX design, stratégie, développement web, maintenance... à votre écoute pour vous ouvrir la voie du web !",
              "projectUrl": "https://www.fantassin.fr/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 1,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Blackstone - The World's Largest Alternative Asset Manager",
              "slug": "blackstone-alternative-asset-manager",
              "shortDescription": "World's largest alternative asset manager built on WordPress Gutenberg.",
              "description": "Blackstone is the world’s largest alternative asset manager, serving institutional and individual investors by building strong businesses positioned to deliver lasting value.",
              "projectUrl": "https://www.blackstone.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 2,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Fluxym",
              "slug": "fluxym-wordpress-gutenberg",
              "shortDescription": "Source-to-Pay and Procurement advisory and integration platform on WordPress Gutenberg.",
              "description": "Agence WordPress créative et plateforme de conseil et d’intégration Source-to-Pay / Procurement construite avec des blocs WordPress Gutenberg sur mesure.",
              "projectUrl": "https://www.fluxym.com/en/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 3,
              "status": "ACTIVE",
              "links": []
            }
          ]
        },
        {
          "name": "Wix",
          "slug": "wix",
          "description": "Wix Studio and custom dynamic pages.",
          "sortOrder": 2,
          "status": "ACTIVE",
          "projects": [
            {
              "name": "Prairie Side",
              "slug": "prairie-side",
              "shortDescription": "Wix website for a local business with modern design and booking integration.",
              "description": "A sleek local business portal with appointment scheduling, customer review highlights, and interactive service packages built with dynamic Wix Studio components.",
              "projectUrl": "https://prairieside.example.com",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 2,
              "status": "ACTIVE",
              "links": []
            }
          ]
        },
        {
          "name": "Shopify",
          "slug": "shopify",
          "description": "Liquid storefronts, apps, and headless commerce.",
          "sortOrder": 3,
          "status": "ACTIVE",
          "projects": [
            {
              "name": "Marc Loire",
              "slug": "marc-loire-su47",
              "shortDescription": "Shopify eCommerce store with custom design and product setup.",
              "description": "An elegant footwear and fashion eCommerce store built on Shopify with advanced multi-attribute filtering, collection showcases, rapid checkout, and inventory tracking integration.",
              "projectUrl": "https://marcloire.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 0,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Airstride Equine",
              "slug": "airstride-equine-jox2",
              "shortDescription": "Equestrian products and services platform.",
              "description": "Specialized equestrian website.",
              "projectUrl": "https://airstrideequine.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 0,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Seven Grams Caffe",
              "slug": "seven-grams-caffe",
              "shortDescription": "Artisanal coffee and bakery online shop.",
              "description": "Specialty bakery and coffee beans store on Shopify.",
              "projectUrl": "https://sevengramscaffe.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 5,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Ruby Love",
              "slug": "ruby-love",
              "shortDescription": "Apparel and lifestyle eCommerce store.",
              "description": "High-volume direct to consumer Shopify brand.",
              "projectUrl": "https://www.rubylove.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 6,
              "status": "ACTIVE",
              "links": []
            }
          ]
        },
        {
          "name": "Squarespace",
          "slug": "squarespace",
          "description": "Modern editorial and business sites.",
          "sortOrder": 4,
          "status": "ACTIVE",
          "projects": [
            {
              "name": "Muse Studio",
              "slug": "muse-studio",
              "shortDescription": "Creative brand and digital design studio built on Squarespace.",
              "description": "A modern design studio website built on Squarespace featuring bespoke typography, minimalist grid layouts, smooth interactive transitions, and a curated portfolio showcase.",
              "projectUrl": "https://musestudio.uk/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 1,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Kreatives",
              "slug": "kreatives-co",
              "shortDescription": "Digital creative agency and design studio portfolio on Squarespace.",
              "description": "A dynamic creative agency website built on Squarespace with fluid full-width imagery, modern editorial typography, and seamless contact integration.",
              "projectUrl": "https://www.kreatives.co/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 2,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Supernatural Kitchen",
              "slug": "supernatural-kitchen",
              "shortDescription": "Vibrant e-commerce and lifestyle storefront built on Squarespace.",
              "description": "An eye-catching culinary e-commerce website built on Squarespace featuring vibrant product layouts, recipe indices, custom branding elements, and integrated shopping cart flows.",
              "projectUrl": "https://www.supernaturalkitchen.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 3,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Cameron Ross Design",
              "slug": "cameron-ross-design",
              "shortDescription": "Architecture and interior design studio portfolio on Squarespace.",
              "description": "An elegant architectural and spatial design portfolio built on Squarespace featuring full-bleed photography, refined typography, and project case study galleries.",
              "projectUrl": "https://www.cameronrossdesign.com.au/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 4,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Power Podiatry Peninsula",
              "slug": "power-podiatry-peninsula",
              "shortDescription": "Modern healthcare and podiatry clinic website on Squarespace.",
              "description": "A professional allied health clinic website built on Squarespace with service descriptions, practitioner profiles, clinic location maps, and patient booking integrations.",
              "projectUrl": "https://www.powerpodiatrypeninsula.com.au/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 5,
              "status": "ACTIVE",
              "links": []
            }
          ]
        },
        {
          "name": "Framer",
          "slug": "framer",
          "description": "Interactive animations and marketing sites.",
          "sortOrder": 5,
          "status": "ACTIVE",
          "projects": [
            {
              "name": "wonderful.ai",
              "slug": "wonderfulai-leyk-97bv",
              "shortDescription": "wonderful.ai",
              "description": "wonderful.ai",
              "projectUrl": "https://www.wonderful.ai/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 0,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Auteur Wines",
              "slug": "auteur-wines-l2uy",
              "shortDescription": "Fine wine boutique website built on WordPress.",
              "description": "Fine wine showcase and e-commerce portal.",
              "projectUrl": "https://auteurwines.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 0,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "lasso commerce",
              "slug": "lasso-commerce-lydp-h9dc",
              "shortDescription": "lasso commerce",
              "description": "lasso commerce",
              "projectUrl": "https://lassocommerce.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 0,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Listenlabs ai",
              "slug": "listenlabs-ai-peec-lxci",
              "shortDescription": "Listenlabs ai",
              "description": "Listenlabs ai",
              "projectUrl": "https://listenlabs.ai/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 0,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "ifbvastgoed.be",
              "slug": "ifbvastgoedbe-l8af-4tz0",
              "shortDescription": "ifbvastgoed.be",
              "description": "ifbvastgoed.be",
              "projectUrl": "https://ifbvastgoed.be/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 0,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "orangeleaf",
              "slug": "orangeleaf-2ds9-myy6",
              "shortDescription": "orangeleaf",
              "description": "orangeleaf",
              "projectUrl": "https://www.orangeleaf.ca/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 0,
              "status": "ACTIVE",
              "links": []
            }
          ]
        },
        {
          "name": "Webflow",
          "slug": "webflow",
          "description": "Responsive visual development and CMS.",
          "sortOrder": 6,
          "status": "ACTIVE",
          "projects": []
        },
        {
          "name": "LearnDash",
          "slug": "learndash",
          "description": "WordPress LMS and online course platform solutions.",
          "sortOrder": 10,
          "status": "ACTIVE",
          "projects": [
            {
              "name": "Alex Rusch Institut",
              "slug": "alex-rusch-institut",
              "shortDescription": "LearnDash LMS platform for online education and coaching courses.",
              "description": "A comprehensive e-learning academy powered by LearnDash featuring course modules, progress tracking, and student certification.",
              "projectUrl": "https://alexruschinstitut.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 1,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Fierce Inc",
              "slug": "fierce-inc",
              "shortDescription": "Interactive corporate training and leadership courses on LearnDash.",
              "description": "Enterprise conversation and leadership training portal built on WordPress and LearnDash with interactive learning paths.",
              "projectUrl": "https://fierceinc.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 2,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "NuScienta",
              "slug": "nuscienta",
              "shortDescription": "Professional scientific learning and training LMS system.",
              "description": "Specialized knowledge management and training LMS website built on LearnDash.",
              "projectUrl": "https://nuscienta.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 3,
              "status": "ACTIVE",
              "links": []
            }
          ]
        }
      ]
    },
    {
      "name": "Web Development",
      "slug": "web-development",
      "description": "Full-stack web applications, APIs, and modern frontends.",
      "sortOrder": 2,
      "status": "ACTIVE",
      "technologies": [
        {
          "name": "React + Vite",
          "slug": "react-vite",
          "description": "Lightning-fast client-side SPAs.",
          "sortOrder": 1,
          "status": "ACTIVE",
          "projects": []
        },
        {
          "name": "React Node Express",
          "slug": "react-node-express",
          "description": "Full-stack React, Next.js, Node.js, and Express.js platforms and web applications.",
          "sortOrder": 1,
          "status": "ACTIVE",
          "projects": [
            {
              "name": "Rounx — AI-integrated Job and Freelance Platform",
              "slug": "rounx",
              "shortDescription": "China-based platform connecting job seekers, freelancers, and businesses, with AI integration.",
              "description": "Worked on a China-based platform connecting job seekers, freelancers, and businesses, with AI integration.",
              "projectUrl": "https://www.rounx.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 1,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Stratavor — Strategic Intelligence Platform",
              "slug": "stratavor",
              "shortDescription": "AI strategic intelligence platform connecting financial integrations to generate automated insights.",
              "description": "Technology: Next.js, Node.js. AI strategic intelligence platform connecting financial integrations to generate automated insights.",
              "projectUrl": "https://www.stratavor.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 2,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Rent ID — Trust and Safety Platform",
              "slug": "rent-id",
              "shortDescription": "Platform integrating insurance, roadside assistance, and resolution tools.",
              "description": "Technology: Next.js, Node.js. Platform integrating insurance, roadside assistance, and resolution tools.",
              "projectUrl": "https://www.rentid.io/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 3,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "ScoutLogic — Background Check Platform",
              "slug": "scoutlogic",
              "shortDescription": "Pre-employment background screening platform supporting verification services.",
              "description": "Technology: Node.js, Prismic CMS. Pre-employment background screening platform supporting verification services.",
              "projectUrl": "https://www.scoutlogic.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 4,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Perennial Math — Math Competition Platform",
              "slug": "perennial-math",
              "shortDescription": "International competition platform featuring online leagues, tournaments, and practice resources.",
              "description": "Technology: Next.js, Node.js. International competition platform featuring online leagues, tournaments, and practice resources for coaches.",
              "projectUrl": "https://perennialmath.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 5,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Luxury Limo Paris",
              "slug": "luxury-limo-paris",
              "shortDescription": "Chauffeur platform featuring VIP booking, a luxury fleet showcase, and airport transfer services.",
              "description": "Technology: Next.js. Chauffeur platform featuring VIP booking, a luxury fleet showcase, and airport transfer services.",
              "projectUrl": "https://luxurylimoparis.com/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 6,
              "status": "ACTIVE",
              "links": []
            }
          ]
        },
        {
          "name": "Next.js",
          "slug": "nextjs",
          "description": "Full-stack SSR and App Router applications.",
          "sortOrder": 2,
          "status": "ACTIVE",
          "projects": []
        },
        {
          "name": "MERN Stack",
          "slug": "mern-stack",
          "description": "MongoDB, Express, React, and Node.js solutions.",
          "sortOrder": 3,
          "status": "ACTIVE",
          "projects": []
        },
        {
          "name": "Node.js",
          "slug": "nodejs",
          "description": "Backend microservices, REST, and GraphQL APIs.",
          "sortOrder": 4,
          "status": "ACTIVE",
          "projects": []
        },
        {
          "name": "Laravel",
          "slug": "laravel",
          "description": "Robust PHP web application framework.",
          "sortOrder": 5,
          "status": "ACTIVE",
          "projects": []
        },
        {
          "name": "PHP",
          "slug": "php",
          "description": "Custom server-side scripting and web utilities.",
          "sortOrder": 6,
          "status": "ACTIVE",
          "projects": []
        },
        {
          "name": "CodeIgniter",
          "slug": "codeigniter",
          "description": "Lightweight MVC PHP framework.",
          "sortOrder": 7,
          "status": "ACTIVE",
          "projects": [
            {
              "name": "WhereYouEat",
              "slug": "whereyoueat",
              "shortDescription": "Custom web application built with CodeIgniter and MySQL.",
              "description": "A comprehensive dining portal and reservation engine built using CodeIgniter and MySQL. Features live table booking, user ratings, dish photo uploads, and owner management dashboards.",
              "projectUrl": "https://whereyoueat.example.com",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 5,
              "status": "ACTIVE",
              "links": []
            }
          ]
        },
        {
          "name": "HTML & CSS",
          "slug": "html-css",
          "description": "Clean HTML5, modern CSS3 and responsive frontend web pages.",
          "sortOrder": 10,
          "status": "ACTIVE",
          "projects": [
            {
              "name": "Specialsnickeriet",
              "slug": "specialsnickeriet",
              "shortDescription": "Clean custom carpentry and craft showcase website built with HTML and CSS.",
              "description": "High-performance bespoke carpentry showcase site with responsive layout, semantic markup, and clean styling.",
              "projectUrl": "https://specialsnickeriet.netlify.app/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 1,
              "status": "ACTIVE",
              "links": []
            }
          ]
        }
      ]
    },
    {
      "name": "App Development",
      "slug": "app-development",
      "description": "Cross-platform mobile applications for iOS and Android.",
      "sortOrder": 3,
      "status": "ACTIVE",
      "technologies": [
        {
          "name": "React Native",
          "slug": "react-native",
          "description": "Native mobile apps built with React.",
          "sortOrder": 1,
          "status": "ACTIVE",
          "projects": []
        },
        {
          "name": "Mobile Apps",
          "slug": "mobile-apps",
          "description": "Production iOS and Android mobile applications.",
          "sortOrder": 1,
          "status": "ACTIVE",
          "projects": [
            {
              "name": "Falaya – Real Estate Platform",
              "slug": "falaya-real-estate",
              "shortDescription": "Modern real estate platform with iOS, Android apps and web portal.",
              "description": "Full-service real estate platform connecting buyers and sellers with low-commission flat fee pricing, automated tours, and instant messaging.",
              "projectUrl": "https://falaya.com/",
              "appStoreUrl": "https://apps.apple.com/us/app/falaya/id1551154057",
              "playStoreUrl": "https://play.google.com/store/apps/details?id=app.falaya.com",
              "githubUrl": null,
              "featured": true,
              "sortOrder": 2,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Kazderni – Travel and Booking App",
              "slug": "kazderni-travel-booking",
              "shortDescription": "Travel discovery and booking app for iOS and Android.",
              "description": "Interactive tourism, excursion booking, and trip itinerary platform with curated destination guides.",
              "projectUrl": "https://play.google.com/store/apps/details?id=com.kazderni.app",
              "appStoreUrl": "https://apps.apple.com/bh/app/kazderni/id1608546260",
              "playStoreUrl": "https://play.google.com/store/apps/details?id=com.kazderni.app",
              "githubUrl": null,
              "featured": true,
              "sortOrder": 3,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Morain Mahj",
              "slug": "morain-mahj-llc",
              "shortDescription": "Mahjong tile puzzle game and community app with iOS and web platforms.",
              "description": "Engaging tile-matching Mahjong game with multiplayer leaderboards, custom card rules, and smooth touch controls.",
              "projectUrl": "https://morainmahj.com/",
              "appStoreUrl": "https://apps.apple.com/in/app/morain-mahj-llc/id6764858151",
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 4,
              "status": "ACTIVE",
              "links": []
            }
          ]
        },
        {
          "name": "Expo",
          "slug": "expo",
          "description": "Universal React Native application suite.",
          "sortOrder": 2,
          "status": "ACTIVE",
          "projects": []
        },
        {
          "name": "Capacitor",
          "slug": "capacitor",
          "description": "Cross-platform web-to-native mobile apps.",
          "sortOrder": 3,
          "status": "ACTIVE",
          "projects": [
            {
              "name": "Existensia",
              "slug": "existensia-wg76",
              "shortDescription": "Existensia",
              "description": "Existensia",
              "projectUrl": "https://existensia.app/",
              "appStoreUrl": null,
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": false,
              "sortOrder": 0,
              "status": "ACTIVE",
              "links": [
                {
                  "label": "iOS:",
                  "url": "https://apps.apple.com/in/app/existensia/id6797443719",
                  "sortOrder": 1
                }
              ]
            },
            {
              "name": "Morain Mahj",
              "slug": "morain-mahj",
              "shortDescription": "Player registration, RSVP, organizer dashboards, subscriptions, push notifications, and Capacitor iOS delivery.",
              "description": "Player registration and RSVP, organizer dashboards, subscriptions and trials, role-based permissions, waitlists, push notifications, and Capacitor iOS delivery.",
              "projectUrl": "https://morainmahj.com/",
              "appStoreUrl": "https://apps.apple.com/in/app/morain-mahj-llc/id6764858151",
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 1,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Edge AI Sports Intelligence",
              "slug": "edge-ai-sports-intelligence",
              "shortDescription": "Sports-focused web and mobile experience, payment integration, media uploads, and Capacitor iOS deployment.",
              "description": "Sports-focused web and mobile experience, payment integration, media uploads, and Capacitor iOS deployment.",
              "projectUrl": "https://edge-ai-app.com/",
              "appStoreUrl": "https://apps.apple.com/us/app/edge-ai-sports-intelligence/id6772319600",
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 2,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "SwapCo",
              "slug": "swapco",
              "shortDescription": "Mobile app development across iOS and Android.",
              "description": "Mobile app development across iOS and Android.",
              "projectUrl": "https://swapco.com.au/",
              "appStoreUrl": "https://apps.apple.com/au/app/swapco/id1528109341",
              "playStoreUrl": "https://play.google.com/store/apps/details?id=com.swapco.android",
              "githubUrl": null,
              "featured": true,
              "sortOrder": 3,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Falaya",
              "slug": "falaya",
              "shortDescription": "Mobile application work across iOS and Android.",
              "description": "Mobile application work across iOS and Android.",
              "projectUrl": "https://falaya.com/",
              "appStoreUrl": "https://apps.apple.com/us/app/falaya/id1551154057",
              "playStoreUrl": "https://play.google.com/store/apps/details?id=app.falaya.com",
              "githubUrl": null,
              "featured": true,
              "sortOrder": 4,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Kazderni",
              "slug": "kazderni",
              "shortDescription": "Travel and booking app platform across Android and iOS.",
              "description": "Platform: Android and ios travel and booking application.",
              "projectUrl": "https://play.google.com/store/apps/details?id=com.kazderni.app",
              "appStoreUrl": "https://apps.apple.com/bh/app/kazderni/id1608546260",
              "playStoreUrl": "https://play.google.com/store/apps/details?id=com.kazderni.app",
              "githubUrl": null,
              "featured": true,
              "sortOrder": 5,
              "status": "ACTIVE",
              "links": []
            },
            {
              "name": "Existensia",
              "slug": "existensia",
              "shortDescription": "Lovable, React + Vite, Capacitor mobile and web app.",
              "description": "Built with Lovable, React + Vite, and Capacitor for iOS and Web.",
              "projectUrl": "https://existensia.app/",
              "appStoreUrl": "https://apps.apple.com/in/app/existensia/id6797443719",
              "playStoreUrl": null,
              "githubUrl": null,
              "featured": true,
              "sortOrder": 6,
              "status": "ACTIVE",
              "links": []
            }
          ]
        },
        {
          "name": "Flutter",
          "slug": "flutter",
          "description": "Multi-platform compiled UI toolkit.",
          "sortOrder": 4,
          "status": "ACTIVE",
          "projects": []
        }
      ]
    },
    {
      "name": "Other",
      "slug": "other",
      "description": "Specialized tools, utilities, scripts, and miscellaneous systems.",
      "sortOrder": 4,
      "status": "ACTIVE",
      "technologies": [
        {
          "name": "Other",
          "slug": "other-tech",
          "description": "Other technologies and platforms.",
          "sortOrder": 1,
          "status": "ACTIVE",
          "projects": []
        }
      ]
    }
  ];

  for (const catData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: {
        name: catData.name,
        description: catData.description,
        sortOrder: catData.sortOrder,
        status: Status[catData.status as keyof typeof Status] || Status.ACTIVE,
      },
      create: {
        name: catData.name,
        slug: catData.slug,
        description: catData.description,
        sortOrder: catData.sortOrder,
        status: Status[catData.status as keyof typeof Status] || Status.ACTIVE,
      },
    });

    for (const techData of catData.technologies) {
      const technology = await prisma.technology.upsert({
        where: { slug: techData.slug },
        update: {
          name: techData.name,
          description: techData.description,
          sortOrder: techData.sortOrder,
          status: Status[techData.status as keyof typeof Status] || Status.ACTIVE,
          categoryId: category.id,
        },
        create: {
          name: techData.name,
          slug: techData.slug,
          description: techData.description,
          sortOrder: techData.sortOrder,
          status: Status[techData.status as keyof typeof Status] || Status.ACTIVE,
          categoryId: category.id,
        },
      });

      for (const projData of techData.projects) {
        const { links, ...projectFields } = projData;
        const project = await prisma.project.upsert({
          where: { slug: projData.slug },
          update: {
            ...projectFields,
            status: ProjectStatus[projData.status as keyof typeof ProjectStatus] || ProjectStatus.ACTIVE,
            categoryId: category.id,
            technologyId: technology.id,
          },
          create: {
            ...projectFields,
            status: ProjectStatus[projData.status as keyof typeof ProjectStatus] || ProjectStatus.ACTIVE,
            categoryId: category.id,
            technologyId: technology.id,
          },
        });

        if (links && links.length > 0) {
          await prisma.projectLink.deleteMany({ where: { projectId: project.id } });
          for (const link of links) {
            await prisma.projectLink.create({
              data: {
                projectId: project.id,
                label: link.label,
                url: link.url,
                sortOrder: link.sortOrder,
              },
            });
          }
        }
      }
    }
  }

  console.log("Database seeded successfully with all current categories, technologies, and projects!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
