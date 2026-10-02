import { requireClient } from "@/lib/auth";
import { getClientDocumentsContext } from "@/lib/data/documents";
import { ClientDocumentsUpload } from "@/app/components/dashboard/ClientDocumentsUpload";

export default async function ClientDocumentsPage() {
  const profile = await requireClient();
  const { documents, contractDownloadUrl } = await getClientDocumentsContext(
    profile.user_id
  );

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-textdark">
        My Documents
      </h1>
      <p className="text-textdark/60 mt-1">
        Upload and manage the documents required for your account.
      </p>

      <div className="mt-6">
        <ClientDocumentsUpload
          documents={documents}
          contractDownloadUrl={contractDownloadUrl}
        />
      </div>
    </div>
  );
}