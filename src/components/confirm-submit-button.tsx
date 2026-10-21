"use client";

export function ConfirmSubmitButton({ label }: { label: string }) {
  return (
    <button
      className="button button-danger"
      type="submit"
      onClick={(event) => {
        if (!window.confirm("Delete this media record and its ratings and comments?")) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
