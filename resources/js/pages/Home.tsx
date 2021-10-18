import React from "react";
import { useHistory } from "react-router-dom";
import { useTranslationStore } from "../hooks/useTranslationStore";

export const HomePage: React.FC = () => {
    const { t } = useTranslationStore();
    const history = useHistory();

    return <div className="HomePage">HOMESSS</div>;
};
