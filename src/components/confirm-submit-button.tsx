"use client";

export function ConfirmSubmitButton({
  label,
  message = "Delete this record? This action cannot be undone.",
}: {
  label: string;
  message?: string;
}) {
  return (
    <button
      className="button button-danger"
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
