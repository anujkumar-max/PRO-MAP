import FlowDiagramView from '@/components/flow/FlowDiagramView';

export async function generateStaticParams() {
  return [{ id: 'default' }];
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <FlowDiagramView id={id} />;
}
