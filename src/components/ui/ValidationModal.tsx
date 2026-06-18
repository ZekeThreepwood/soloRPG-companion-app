import type { Issue } from "../../app/campaignValidator";
import "./ValidationModal.css";

type Props = {
    issues: Issue[];
    hasErrors: boolean;
    onExportAnyway: () => void;
    onCancel: () => void;
};

export function ValidationModal({ issues, hasErrors, onExportAnyway, onCancel }: Props) {
    const errors = issues.filter((i) => i.severity === "error");
    const warnings = issues.filter((i) => i.severity === "warning");

    return (
        <div className="validationOverlay" onClick={onCancel}>
            <div className="validationModal" onClick={(e) => e.stopPropagation()}>
                <div className="validationHeader">
                    <span className="validationTitle">
                        {hasErrors ? "Export Issues Found" : "Export Warnings"}
                    </span>
                </div>

                <div className="validationBody">
                    {hasErrors && (
                        <p className="validationSummaryError">
                            {errors.length} error{errors.length !== 1 ? "s" : ""} found — this campaign may not
                            load correctly in the engine.
                        </p>
                    )}
                    {!hasErrors && warnings.length > 0 && (
                        <p className="validationSummaryWarn">
                            {warnings.length} warning{warnings.length !== 1 ? "s" : ""} found — review before
                            exporting.
                        </p>
                    )}

                    <ul className="validationList">
                        {errors.map((issue, i) => (
                            <li key={i} className="validationItem validationItemError">
                                <span className="validationBadge validationBadgeError">Error</span>
                                <span className="validationMsg">{issue.message}</span>
                            </li>
                        ))}
                        {warnings.map((issue, i) => (
                            <li key={i} className="validationItem validationItemWarn">
                                <span className="validationBadge validationBadgeWarn">Warn</span>
                                <span className="validationMsg">{issue.message}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="validationFooter">
                    <button type="button" className="validationBtnCancel" onClick={onCancel}>
                        Go Back
                    </button>
                    <button type="button" className="validationBtnExport" onClick={onExportAnyway}>
                        Export Anyway
                    </button>
                </div>
            </div>
        </div>
    );
}
