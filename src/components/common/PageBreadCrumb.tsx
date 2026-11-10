import React from "react";

interface BreadcrumbProps {
  pageTitle: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {pageTitle}
      </h2>
    </div>
  );
};

export default PageBreadcrumb;
