export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function CourseIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
