import WorkflowClient from "./WorkflowClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function WorkflowPage({ params }: PageProps) {
  const { id } = await params;
  return <WorkflowClient id={id} />;
}
