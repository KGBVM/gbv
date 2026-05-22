import { Button } from "react-bootstrap";
import { BsSun, BsMoon } from "react-icons/bs";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center gap-2 rounded-pill"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            {theme === "dark" ? <BsSun size={16} /> : <BsMoon size={16} />}
        </Button>
    );
}
