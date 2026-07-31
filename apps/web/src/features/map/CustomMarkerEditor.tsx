import {
  customMarkerIconGroups,
  getCustomMarkerIconLabel,
  type CustomMarkerIcon,
} from "./customMarkers";
import { MapMarkerIcon } from "./MapMarkerIcon";

export function CustomMarkerEditor({
  name,
  icon,
  message,
  isEditing,
  onNameChange,
  onIconChange,
  onSave,
  onRoute,
  onDelete,
}: {
  name: string;
  icon: CustomMarkerIcon;
  message: string;
  isEditing: boolean;
  onNameChange: (name: string) => void;
  onIconChange: (icon: CustomMarkerIcon) => void;
  onSave: () => void;
  onRoute: () => void;
  onDelete: () => void;
}) {
  return (
    <form
      className="custom-marker-editor"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <label className="custom-marker-name">
        <span>Marker name</span>
        <input
          type="text"
          maxLength={60}
          value={name}
          placeholder="e.g. Grove Street stash"
          onChange={(event) => onNameChange(event.target.value)}
        />
      </label>
      <fieldset className="custom-marker-icons">
        <legend>Choose an icon</legend>
        {customMarkerIconGroups.map((group) => (
          <div key={group.label} className="custom-marker-icon-group">
            <span>{group.label}</span>
            <div>
              {group.icons.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={icon === option.id ? "active" : ""}
                  aria-label={option.label}
                  aria-pressed={icon === option.id}
                  title={option.label}
                  onClick={() => onIconChange(option.id)}
                >
                  <MapMarkerIcon icon={option.id} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </fieldset>
      <span className="custom-marker-icon-name">{getCustomMarkerIconLabel(icon)} icon</span>
      <div className="custom-marker-actions">
        <button type="submit" className="custom-marker-save">
          {isEditing ? "Update marker" : "Save marker"}
        </button>
        {isEditing && (
          <>
            <button type="button" onClick={onRoute}>Route here</button>
            <button type="button" className="custom-marker-delete" onClick={onDelete}>Delete</button>
          </>
        )}
      </div>
      <small>Saved privately in this browser. Nothing is uploaded.</small>
      {message && <span className="custom-marker-message">{message}</span>}
    </form>
  );
}
