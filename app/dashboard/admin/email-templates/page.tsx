import Link from "next/link";
import { getAdminEmailTemplates } from "@/lib/data/admin";

export default async function AdminEmailTemplatesPage() {
  const templates = await getAdminEmailTemplates();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textdark">
            Email Templates
          </h1>
          <p className="text-textdark/60 mt-1">
            Preview and edit the emails sent to drivers and admins.
          </p>
        </div>
      </div>

      <div className="bg-white border border-grey/40 rounded-2xl overflow-hidden mt-8">
        {templates.length === 0 ? (
          <div className="p-10 text-center text-textdark/60">
            No email templates yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grey/40 text-left text-textdark/60">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden md:table-cell px-4 py-3 font-medium">
                  Slug
                </th>
                <th className="hidden md:table-cell px-4 py-3 font-medium">
                  Subject
                </th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr
                  key={template.id}
                  className="border-b border-grey/20 last:border-0 hover:bg-offwhite"
                >
                  <td className="px-4 py-3 font-medium text-textdark">
                    {template.name}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-textdark/60">
                    {template.slug}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-textdark/60">
                    {template.subject}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/admin/email-templates/${template.id}/edit`}
                      className="inline-flex items-center gap-2 text-navy font-semibold hover:text-orange"
                    >
                      Preview &amp; edit &rarr;
                    </Link>
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
