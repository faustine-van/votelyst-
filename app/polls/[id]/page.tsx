import { useParams } from 'next/navigation';

export default function PollDetailPage() {
  const { id } = useParams();
  return <div className="p-4">Poll details for {id} will appear here.</div>;
}
