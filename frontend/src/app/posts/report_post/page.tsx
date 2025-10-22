"use client"

import React, { useState} from 'react';
import { Post } from '@/types/dashboard/post';
import { motion } from 'framer-motion';
import { Report } from '@/services/user/report';

interface ReportModalProps {
    post: Post;
    onClose: () => void;
}

export default function ReportPost({ post, onClose }: ReportModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        target_type: "",
        target_id: post.id,
        reason: "",
    });

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try{
            await Report({...formData, target_type: "post"})
            console.log("Report Success!");
            onClose();
        }catch(err: unknown){
            console.log(err);
        }finally{
            setIsSubmitting(false);
        }
    };

    const popVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
    };

    return (
        <div
            className="fixed inset-0 backdrop-blur-xs inset-0 min-w-xl flex items-center justify-center z-50 p-4 text-white"
            onClick={onClose}
        >
            <motion.div
                className="bg-white p-8 rounded-xl shadow-lg text-left ml-60 max-w-xl w-full"
                onClick={(e) => e.stopPropagation()}
                variants={popVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2, ease: 'easeInOut' }}            
            >
                <h3 className="text-2xl font-bold mb-4 text-black">
                    Report Post
                </h3>
                <p className="mb-1 text-black">Post title:</p>
                <p className="mb-6 font-semibold text-black bg-gray-200 p-3 rounded-lg">
                    {post.title}"
                </p>

                <form onSubmit={handleFormSubmit}>
                    <div className="mb-6">
                        <label htmlFor="details" className="block text-black mb-2">
                            Reason:
                        </label>
                        <textarea
                            value={formData.reason}
                            onChange={(e) =>
                            setFormData({ ...formData, reason: e.target.value })
                            }
                            rows={6}
                            className="w-full p-2 bg-gray-200 rounded-lg text-black"
                            placeholder="Add more details..."
                        />
                    </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer"
                        >
                            Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer"
                            >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
            </motion.div>
        </div>
    );
}
