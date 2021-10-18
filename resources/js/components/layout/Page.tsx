import React from "react";
import { PageFooter } from "./PageFooter";
import { PageHeader } from "./PageHeader";

export const Page: React.FC = ({ children }) => {
    return (
        <div className="Page">
            <PageHeader />
            {children}
            <PageFooter />
        </div>
    );
};
