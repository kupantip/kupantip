import Post from '@/components/dashboard/post'

export default function DashboardPage() {
    return (
        <div className="w-full flex">
            <div>
                <Post />
            </div>
            <div>Right Bar</div>
        </div>
    )
}
