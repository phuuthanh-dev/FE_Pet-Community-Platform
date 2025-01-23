/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MessageCircle, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";
import VerifiedBadge from "./VerifiedBadge";
import Carousel from "./ui/carousel";
import { addCommentAPI } from "@/apis/comment";
import { FaBookmark, FaHeart, FaRegHeart } from "react-icons/fa";
import { likeOrDislikeAPI } from "@/apis/post";
import { LuBookmark } from "react-icons/lu";
import { calculateTimeAgo } from "@/utils/calculateTimeAgo";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);
  const [comment, setComment] = useState([]);
  const [liked, setLiked] = useState(false);
  const [postLike, setPostLike] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments);
      setLiked(selectedPost.likes.includes(user?._id) || false);
      setPostLike(selectedPost.likes.length);
      setBookmarked(user.bookmarks.includes(selectedPost?._id) || false);
    }
  }, [selectedPost, user]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const sendMessageHandler = async () => {
    try {
      const res = await addCommentAPI(selectedPost._id, text);

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === selectedPost._id
            ? { ...p, comments: updatedCommentData }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await likeOrDislikeAPI(selectedPost._id, action);
      console.log(res.data);
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

        // apne post ko update krunga
        const updatedPostData = posts.map((p) =>
          p._id === selectedPost._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-[1700px] h-[100vh]"
        style={{ padding: "0px" }}
      >
        <div className="flex h-full">
          {/* Left side - Image */}
          <div className="flex-1 flex justify-center items-center">
            {selectedPost &&
            (selectedPost.image?.length || 0) +
              (selectedPost.video?.length || 0) ===
              1 ? (
              selectedPost.image?.length === 1 ? (
                <img
                  src={selectedPost.image[0]}
                  alt="post_img"
                  className="max-h-screen w-auto object-contain"
                />
              ) : (
                <video
                  src={selectedPost.video[0]}
                  className="max-h-screen w-auto object-contain"
                  autoPlay
                  loop
                />
              )
            ) : (
              <Carousel
                autoSlide={false}
                containerClass="carousel-container"
                itemClass="carousel-item"
              >
                {[
                  ...(selectedPost?.image || []).map((image, index) => (
                    <img
                      key={`img-${index}`}
                      src={image}
                      alt={`post_img_${index}`}
                    />
                  )),
                  ...(selectedPost?.video || []).map((video, index) => (
                    <video
                      key={`vid-${index}`}
                      src={video}
                      className="object-cover rounded-md"
                      autoPlay
                      muted
                      loop
                    />
                  )),
                ]}
              </Carousel>
            )}
          </div>

          {/* Right side - Details */}
          <div className="w-[400px] flex flex-col border-l">
            {/* Post header */}
            <div className="flex justify-between items-center gap-2 p-4 border-b">
              <div className="flex gap-3 items-center">
                <Link
                  to={`/profile/${selectedPost?.author?.username}`}
                  target="_blank"
                >
                  <Avatar
                    className="h-8 w-8"
                    style={{ border: "1px solid #e0e0e0" }}
                  >
                    <AvatarImage src={selectedPost?.author.profilePicture} />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex flex-col">
                  <div className="flex text-sm items-center gap-2">
                    <Link
                      to={`/profile/${selectedPost?.author?.username}`}
                      target="_blank"
                      className="font-semibold"
                    >
                      {selectedPost?.author.username}
                    </Link>
                    {selectedPost?.author.isVerified && (
                      <VerifiedBadge size={14} />
                    )}
                  </div>
                  <span className="text-sm text-gray-500">Hồ Chí Minh</span>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer" />
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center text-sm text-center">
                  <div className="cursor-pointer w-full text-[#ED4956] font-bold">
                    Unfollow
                  </div>
                  <div className="cursor-pointer w-full">Add to favorites</div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Post details */}
            <div className="flex-1 overflow-y-auto">
              {/* Post caption */}
              <div className="flex gap-3 px-4 pt-5">
                <Link
                  to={`/profile/${selectedPost?.author?.username}`}
                  target="_blank"
                >
                  <Avatar
                    className="h-8 w-8"
                    style={{ border: "1px solid #e0e0e0" }}
                  >
                    <AvatarImage src={selectedPost?.author.profilePicture} />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                </Link>

                <span className="text-sm">
                  <div className="inline-flex mr-1">
                    <Link
                      to={`/profile/${selectedPost?.author?.username}`}
                      target="_blank"
                      className="font-semibold inline-flex items-center gap-1"
                    >
                      {selectedPost?.author.username}
                      {selectedPost?.author.isVerified && (
                        <VerifiedBadge
                          size={14}
                          style={{ display: "inline-block" }}
                        />
                      )}
                    </Link>
                  </div>
                  <span className="text-sm whitespace-normal break-all overflow-wrap-anywhere max-w-full">
                    {selectedPost?.caption}
                  </span>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {calculateTimeAgo(selectedPost?.createdAt)}
                  </span>
                </span>
              </div>
              <div className="px-4 py-5 space-y-5">
                {comment.length > 0 &&
                  comment.map((comment) => (
                    <div
                      key={comment._id}
                      className="flex gap-3 justify-between"
                    >
                      <div className="flex gap-3">
                        <Link
                          to={`/profile/${comment.author.username}`}
                          target="_blank"
                        >
                          <Avatar
                            className="h-8 w-8"
                            style={{ border: "1px solid #e0e0e0" }}
                          >
                            <AvatarImage src={comment.author.profilePicture} />
                            <AvatarFallback>UN</AvatarFallback>
                          </Avatar>
                        </Link>
                        <span className="text-sm">
                          <div className="inline-flex mr-1">
                            <Link
                              to={`/profile/${comment.author.username}`}
                              target="_blank"
                              className="font-semibold inline-flex items-center gap-1"
                            >
                              {comment.author.username}
                              {comment.author.isVerified && (
                                <VerifiedBadge
                                  size={14}
                                  style={{ display: "inline-block" }}
                                />
                              )}
                            </Link>
                          </div>
                          <span className="text-sm whitespace-normal break-all overflow-wrap-anywhere max-w-full">
                            {comment.text}
                          </span>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {calculateTimeAgo(comment.createdAt)}
                          </span>
                        </span>
                      </div>
                      <div className="cursor-pointer flex items-start mt-2">
                        <FaRegHeart size={12} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Post actions */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {liked ? (
                    <FaHeart
                      onClick={likeOrDislikeHandler}
                      size={"24"}
                      className="cursor-pointer text-red-600"
                    />
                  ) : (
                    <FaRegHeart
                      onClick={likeOrDislikeHandler}
                      size={"22px"}
                      className="cursor-pointer hover:text-gray-600"
                    />
                  )}
                  <MessageCircle
                    className="w-6 h-6 cursor-pointer"
                    onClick={() => document.querySelector("textarea").focus()}
                  />
                </div>
                {bookmarked ? (
                  <FaBookmark
                    // onClick={bookmarkHandler}
                    className="cursor-pointer hover:text-gray-600"
                    size={24}
                  />
                ) : (
                  <LuBookmark
                    // onClick={bookmarkHandler}
                    className="cursor-pointer hover:text-gray-600"
                    size={24}
                  />
                )}
              </div>
              <p className="font-semibold mt-2">{postLike} likes</p>
            </div>

            <div className="p-4 border-t flex items-center gap-3">
              <textarea
                placeholder="Add a comment..."
                className="flex-1 resize-none outline-none h-[18px] max-h-[80px] text-sm"
                rows={1}
                style={{ height: "18px" }}
                value={text}
                onChange={changeEventHandler}
              />
              <Button
                disabled={!text.trim()}
                onClick={sendMessageHandler}
                variant="outline"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
