import Link from "next/link";
import { getAdminFormTemplates } from "@/lib/data/admin";
import { DeleteFormTemplateButton } from "@/app/components/dashboard/DeleteFormTemplateButton";

export default async function AdminFormsPage() {
  const forms = await getAdminFormTemplates();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            Forms
          </h1>
          <p className="text-textdark/60 mt-1">
            Build application forms sent to leads.
          </p>
        </div>
        <Link
          href="/dashboard/admin/forms/new/edit"
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-5 hover:bg-orange/90"
        >
          Add form
        </Link>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden mt-8">
        {forms.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No forms yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grey/40 text-left text-textdark/60">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden md:table-cell px-4 py-3 font-medium">
                  Slug
                </th>
                <th className="px-4 py-3 font-medium">Fields</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => (
                <tr
                  key={form.id}
                  className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                >
                  <td className="px-4 py-3 font-medium text-textdark">
                    {form.name}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-textdark/60">
                    {form.slug}
                  </td>
                  <td className="px-4 py-3 text-textdark/80">
                    {form.field_schema.length} fields
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        form.status === "published"
                          ? "bg-success/10 text-success"
                          : "bg-grey/40 text-textdark"
                      }`}
                    >
                      {form.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/admin/forms/${form.id}/edit`}
                        className="text-navy font-semibold hover:text-orange"
                      >
                        Edit
                      </Link>
                      <DeleteFormTemplateButton id={form.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}