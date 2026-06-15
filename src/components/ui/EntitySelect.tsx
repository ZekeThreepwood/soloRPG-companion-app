import "./EntitySelect.css";

export type EntityOption = { id: string; name: string };

type EntitySelectProps = {
    options: EntityOption[];
    selected: string[];
    onChange: (ids: string[]) => void;
    noun: string;
};

export function EntitySelect({ options, selected, onChange, noun }: EntitySelectProps) {
    const available = options.filter((o) => !selected.includes(o.id));
    const selectedOptions = selected
        .map((id) => options.find((o) => o.id === id))
        .filter((o): o is EntityOption => o !== undefined);

    return (
        <div className="entitySelect">
            {selectedOptions.length > 0 && (
                <div className="entitySelectPills">
                    {selectedOptions.map((opt) => (
                        <span key={opt.id} className="entityPill">
                            {opt.name}
                            <button
                                type="button"
                                className="entityPillRemove"
                                onClick={() => onChange(selected.filter((s) => s !== opt.id))}
                                aria-label={`Remove ${opt.name}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <select
                className="entitySelectDropdown"
                value=""
                onChange={(e) => {
                    if (e.target.value) onChange([...selected, e.target.value]);
                }}
                disabled={available.length === 0}
            >
                <option value="" disabled>
                    {available.length === 0
                        ? `No ${noun}s created yet`
                        : `— add a ${noun} —`}
                </option>
                {available.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                        {opt.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
