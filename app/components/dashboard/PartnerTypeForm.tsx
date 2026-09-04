import Link from "next/link";
import { savePartnerType } from "@/app/dashboard/admin/cms-actions";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

type PartnerTypeData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  sort_order: number;
};

export function PartnerTypeForm({
  type,
  isNew,
}: {
  type: PartnerTypeData | null;
  isNew: boolean;
}) {
  return (
    <form
      action={savePartnerType}
      className="bg-white border border-grey/40 rounded-2xl p-6 max-w-xl space-y-5"
    >
      <input type="hidden" name="id" value={isNew ? "new" : (type?.id ?? "new")} />

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={type?.name ?? ""}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            defaultValue={type?.slug ?? ""}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={type?.description ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="icon_name" className={labelClass}>
            Icon
          </label>
          <select
            id="icon_name"
            name="icon_name"
            defaultValue={type?.icon_name ?? "fuel"}
            className={inputClass}
          >
            <option value="fuel">Fuel</option>
            <option value="car">Car</option>
            <option value="users">Users</option>
            <option value="wrench">Wrench</option>
          </select>
        </div>
        <div>
          <label htmlFor="sort_order" className={labelClass}>
            Sort Order
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={type?.sort_order ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90"
        >
          Save partner type
        </button>
        <Link
          href="/dashboard/admin/partner-types"
          className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
