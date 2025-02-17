import { getBlogByIdAPI } from '@/apis/blog'
import { calculateTimeAgo } from '@/utils/calculateTimeAgo'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import VerifiedBadge from '../../core/VerifiedBadge'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'

const sharedClasses = {
    textZinc: 'text-zinc-',
    textPrimary: 'text-primary',
    maxContainer: 'max-w-3xl mx-auto p-4',
    textSm: 'text-sm',
    textLg: 'text-lg',
    textXl: 'text-xl',
    text2xl: 'text-2xl',
    text3xl: 'text-3xl',
    fontBold: 'font-bold',
    fontSemibold: 'font-semibold',
    roundedLg: 'rounded-lg',
    wFull: 'w-full',
    hAuto: 'h-auto',
    mb2: 'mb-2',
    mb4: 'mb-4',
    textZinc400: 'text-zinc-400',
    textZinc500: 'text-zinc-500',
    textZinc700: 'text-zinc-700',
}

const BlogDetail = () => {
    const [blog, setBlog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [liked, setLiked] = useState(false)
    const { user } = useSelector((store) => store.auth)
    const location = useLocation();
    const { blogId } = location.state

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await getBlogByIdAPI(blogId)
                if (res.data.success) {
                    setBlog(res.data.data)
                    setLiked(res.data.data.likes.includes(user?.id))
                }
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchBlog()
    }, [blogId])


    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
    if (!blog) return <div className="text-center py-10">Blog not found</div>

    return (
        <div className={sharedClasses.maxContainer}>
            {/* Back Button */}
            <Link
                to="/blog"
                className="group inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-lg 
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium text-gray-600">Back to Blog List</span>
            </Link>

            {/* Breadcrumb */}
            <div className={`${sharedClasses.textZinc500} ${sharedClasses.textSm} ${sharedClasses.mb2}`}>
                PET BLOG / <span className={sharedClasses.textPrimary}>{blog.category}</span>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={blog.author.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-center gap-1">
                        <span className="font-medium">{blog.author.username}</span>
                        {blog.author.isVerified && <VerifiedBadge size={14} />}
                    </div>
                    <span className={`${sharedClasses.textZinc400} ${sharedClasses.textSm}`}>
                        {calculateTimeAgo(blog.createdAt)}
                    </span>
                </div>
            </div>

            {/* Title */}
            <h1 className={`${sharedClasses.text3xl} ${sharedClasses.fontBold} ${sharedClasses.mb4}`}>
                {blog.title}
            </h1>

            {/* Main Image */}
            <img
                src={blog.thumbnail}
                alt={blog.title}
                className={`${sharedClasses.wFull} ${sharedClasses.hAuto} ${sharedClasses.roundedLg} ${sharedClasses.mb4}`}
            />

            {/* Content */}
            <div className={`${sharedClasses.textZinc700} space-y-4 mb-8`}>
                {blog.content}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mb-6">
                <button className="flex items-center gap-2">
                    {liked ? (
                        <FaHeart className="w-6 h-6 text-red-500" />
                    ) : (
                        <FaRegHeart className="w-6 h-6" />
                    )}
                    <span>{blog.likes?.length || 0} likes</span>
                </button>
                <button className="flex items-center gap-2">
                    <MessageCircle className="w-6 h-6" />
                    <span>{blog.comments?.length || 0} comments</span>
                </button>
            </div>


        </div>
    )
}

export default BlogDetail 