export default function WorkspaceLayout({ children }: LayoutProps<"/workspaces/[id]">) {
    return <div className="flex flex-1 flex-col">{children}</div>;
}