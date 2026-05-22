// hooks/useTranslation.js
import { useState, useEffect } from "react";

const useTranslation = () => {
    const translations = {
        en: {
            emergency: "Emergency",
            helpline: "GBV Helpline",
            police: "Police",
            hospital: "Hospital",
            home: "Home",
            about: "About GBV",
            getHelp: "Get Help",
            resources: "Resources",
            agencies: "Partner Agencies",
            news: "News & Events",
            contact: "Contact",
            staffLogin: "Staff Login",
            registerAgency: "Register Agency",
            ourMission: "Our Mission",
            team: "Team",
            annualReports: "Annual Reports",
            mediaCenter: "Media Center",
            findShelter: "Find a Shelter",
            legalAid: "Legal Aid",
            counseling: "Counseling",
            educationalMaterials: "Educational Materials",
            researchData: "Research & Data",
            policyDocuments: "Policy Documents",
            faqs: "FAQs",
            volunteer: "Volunteer",
            donate: "Donate",
            partnerships: "Partnerships",
            events: "Events",
            privacy: "Privacy",
            terms: "Terms",
            accessibility: "Accessibility",
            getHelpNow: "Get Help Now",
            learnMore: "Learn More",
            liveDashboard: "Live Dashboard",
            realTimeStats: "Real-time statistics",
            activeCases: "Active Cases",
            survivorsHelped: "Survivors Helped",
            partnerAgencies: "Partner Agencies",
            responseTime: "Response Time",
            monthlyTarget: "Monthly Target",
            updated: "Updated",
            secure: "Secure",
            knowYourRights: "Know Your Rights, Know Your Resources",
            accessFreeMaterials:
                "Access free educational materials, legal information, and support resources in English, Kiswahili, and Kikamba.",
            viewResources: "View Resources",
            ourLocations: "Our Locations",
            menu: "Menu",
            emergencyContacts: "Emergency Contacts",
            aboutUs: "About Us",
            getSupport: "Get Support",
            getInvolved: "Get Involved",
            aCoordinatedResponse:
                "A coordinated response platform connecting survivors with healthcare, police, legal aid, and social support services across Kitui County.",
        },
        sw: {
            emergency: "Dharura",
            helpline: "Msaada wa GBV",
            police: "Polisi",
            hospital: "Hospitali",
            home: "Nyumbani",
            about: "Kuhusu GBV",
            getHelp: "Pata Msaada",
            resources: "Rasilimali",
            agencies: "Washirika",
            news: "Habari",
            contact: "Wasiliana",
            staffLogin: "Ingia kwa Wafanyakazi",
            registerAgency: "Sajili Shirika",
            ourMission: "Dhamira Yetu",
            team: "Timu",
            annualReports: "Ripoti za Mwaka",
            mediaCenter: "Kituo cha Habari",
            findShelter: "Tafuta Makao",
            legalAid: "Msaada wa Kisheria",
            counseling: "Ushauri Nasaha",
            educationalMaterials: "Nyenzo za Kujifunza",
            researchData: "Utafiti na Takwimu",
            policyDocuments: "Nyaraka za Sera",
            faqs: "Maswali Yanayoulizwa Sana",
            volunteer: "Kujitolea",
            donate: "Changia",
            partnerships: "Ushirikiano",
            events: "Matukio",
            privacy: "Faragha",
            terms: "Masharti",
            accessibility: "Upatikanaji",
            getHelpNow: "Pata Msaada Sasa",
            learnMore: "Jifunze Zaidi",
            liveDashboard: "Dashibodi Hai",
            realTimeStats: "Takwimu za wakati halisi",
            activeCases: "Kesi Zinazoendelea",
            survivorsHelped: "Waliopona Waliosaidiwa",
            partnerAgencies: "Mashirika Washirika",
            responseTime: "Muda wa Kukabiliana",
            monthlyTarget: "Lengo la Mwezi",
            updated: "Iliasishwa",
            secure: "Salama",
            knowYourRights: "Jua Haki Zako, Jua Rasilimali Zako",
            accessFreeMaterials:
                "Pata nyenzo za bure za kielimu, taarifa za kisheria, na usaidizi kwa Kiingereza, Kiswahili, na Kikamba.",
            viewResources: "Tazama Rasilimali",
            ourLocations: "Maeneo Yetu",
            menu: "Menyu",
            emergencyContacts: "Nambari za Dharura",
            aboutUs: "Kuhusu Sisi",
            getSupport: "Pata Msaada",
            getInvolved: "Jihusishe",
            aCoordinatedResponse:
                "Jukwaa la majibu yaliyoratibiwa linalowaunganisha walionusurika na huduma za afya, polisi, msaada wa kisheria, na huduma za usaidizi za kijamii katika Kaunti ya Kitui.",
        },
        kam: {
            emergency: "Mituki",
            helpline: "Utethyo wa GBV",
            police: "Volisi",
            hospital: "Sivitali",
            home: "Nyuumbani",
            about: "Yulu wa GBV",
            getHelp: "Kwata Utethyo",
            resources: "Rasilimali",
            agencies: "Andu ma kwatho",
            news: "Mauvoo",
            contact: "Namba sya utethyo",
            staffLogin: "Lika Accoundini",
            registerAgency: "Andikithya Kikundi",
            ourMission: "Wii Wetu",
            team: "Kivuku",
            annualReports: "Mbuku sya Mwaka",
            mediaCenter: "Kituu kya Mauvoo",
            findShelter: "Saka Kya kwatha",
            legalAid: "Utethyo wa Sheria",
            counseling: "Kwiki syona",
            educationalMaterials: "Vindu vya kusoma",
            researchData: "Uvumbuzi na Mbuku",
            policyDocuments: "Takataka sya Sheria",
            faqs: "kyaukye",
            volunteer: "Kwii wii",
            donate: "Kwaa",
            partnerships: "Umbwikani",
            events: "Mambembi",
            privacy: "Kethukani",
            terms: "Mawetoni",
            accessibility: "Kuwoneka",
            getHelpNow: "Kwata Utethyo Vai",
            learnMore: "Manye Mbingi",
            liveDashboard: "Kibao kya Kima",
            realTimeStats: "Mbuku sya kiseo",
            activeCases: "Misango Yinaitika",
            survivorsHelped: "Atethiwe Vamwe",
            partnerAgencies: "Andu ma kwatho mamwe",
            responseTime: "Wakati wa Kwikililika",
            monthlyTarget: "Kilingo kya Mwai",
            updated: "Yithethiwe",
            secure: "Ntheu",
            knowYourRights: "Manye Wao waku, Manye Vindu Vyaku",
            accessFreeMaterials:
                "Pata vindu vya kusoma vya ulele, mbuku sya sheria, na utethyo kwa Kingereza, Kiswahili, na Kikamba.",
            viewResources: "Tavya Rasilimali",
            ourLocations: "Kituu Kyetu",
            menu: "Menyu",
            emergencyContacts: "Namba sya mituki",
            aboutUs: "Yulu wetu",
            getSupport: "Kwata Utethyo",
            getInvolved: "Ijithya",
            aCoordinatedResponse:
                "Kibanda kya kwikililika kya kwatanithya andu ma kuvikilwa na utethyo wa kiuma, volisi, utethyo wa sheria, na utethyo wa andu koni kwa Kaunti ya Kitui.",
        },
    };

    // Get user's preferred language from browser
    const getUserLanguage = () => {
        if (typeof window === "undefined") return "en";
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith("sw")) return "sw";
        if (browserLang.startsWith("kam")) return "kam";
        return "en";
    };

    // Get saved language from localStorage
    const getSavedLanguage = () => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("preferred_language");
    };

    const [currentLanguage, setCurrentLanguage] = useState(() => {
        const saved = getSavedLanguage();
        if (saved && translations[saved]) return saved;
        return getUserLanguage();
    });

    // Save language preference when it changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("preferred_language", currentLanguage);
        }
    }, [currentLanguage]);

    const translate = (key, language = currentLanguage) => {
        if (translations[language] && translations[language][key]) {
            return translations[language][key];
        }
        if (translations.en[key]) {
            return translations.en[key];
        }
        return key;
    };

    const setLanguage = (lang) => {
        if (translations[lang]) {
            setCurrentLanguage(lang);
            return true;
        }
        return false;
    };

    const getCurrentLanguage = () => currentLanguage;

    // Get all translations for current language as an object
    const t = translations[currentLanguage] || translations.en;

    return {
        t, // Direct translations object for current language
        translate,
        setLanguage,
        getCurrentLanguage,
        getAvailableLanguages: () => Object.keys(translations),
        getLanguageTranslations: (lang) =>
            translations[lang] || translations.en,
        currentLanguage,
    };
};

export default useTranslation;
