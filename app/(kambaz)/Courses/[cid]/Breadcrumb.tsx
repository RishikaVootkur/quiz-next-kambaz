
'use client';
import { usePathname } from 'next/navigation';
import { FaAlignJustify } from 'react-icons/fa';

export default function Breadcrumb({
  course,
  onToggle,
}: {
  course?: { name: string };
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const tail = pathname.split('/').pop();

  return (
    <h2 className="text-danger">
      <FaAlignJustify
        className="me-3 fs-4 mb-1"
        role="button"
        aria-label="Toggle course navigation"
        onClick={onToggle}
      />
      {course?.name} &gt; {tail}
    </h2>
  );
}