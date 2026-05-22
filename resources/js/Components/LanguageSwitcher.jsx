// LanguageSwitcher.jsx
import { Dropdown, Button } from "react-bootstrap";
import useTranslation from "@/hooks/useTranslationData";
import { router, usePage } from "@inertiajs/react";

export default function LanguageSwitcher() {
    const { setLanguage, currentLanguage, getAvailableLanguages } = useTranslation();
    const availableLanguages = getAvailableLanguages();
    const languageNames = { en: "English", sw: "Kiswahili", kam: "Kikamba" };
    const { url } = usePage();

    const handleLanguageChange = (lang) => {
        if (lang === currentLanguage) return;
        
        setLanguage(lang);
        // Visit the current URL with replace state to force re-render
        router.visit(url, {
            replace: true,
            preserveScroll: true,
            preserveState: false, // This forces a fresh component state
        });
    };

    return (
        <Dropdown>
            <Dropdown.Toggle
                as={Button}
                variant="outline-secondary"
                size="sm"
                className="rounded-pill"
            >
                <span className="d-flex align-items-center gap-1">
                    🌐 {languageNames[currentLanguage] || "English"}
                </span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="border-0 shadow-sm">
                {availableLanguages.map((lang) => (
                    <Dropdown.Item
                        key={lang}
                        active={currentLanguage === lang}
                        onClick={() => handleLanguageChange(lang)}
                    >
                        {languageNames[lang]}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}