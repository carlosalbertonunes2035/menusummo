
// components/public/CommentsModal.tsx
import React, { useState } from 'react';
import { Product, Comment } from '../../../types';
import { X, Send } from 'lucide-react';

interface CommentsModalProps {
    product: Product;
    onClose: () => void;
    user: { name: string, phone: string };
    onUpdateUser: (u: { name: string, phone: string }) => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ product, onClose, user, onUpdateUser }) => {
    const [comments, setComments] = useState<Comment[]>([
        // eslint-disable-next-line react-hooks/purity
        { id: '1', productId: product.id, userName: 'Maria Silva', text: 'Maravilhoso! 😍', createdAt: new Date(Date.now() - 3600000) },
        // eslint-disable-next-line react-hooks/purity
        { id: '2', productId: product.id, userName: 'João Pedro', text: 'Chegou super rápido.', createdAt: new Date(Date.now() - 7200000) },
    ]);
    const [newComment, setNewComment] = useState('');
    const [localName, setLocalName] = useState(user.name);
    const [localPhone, setLocalPhone] = useState(user.phone);
    const [step, setStep] = useState<'LIST' | 'IDENTIFY'>('LIST');

    const handlePost = () => {
        if (!newComment.trim()) return;
        if (!user.name || !user.phone) {
            setStep('IDENTIFY');
            return;
        }

        const comment: Comment = {
            id: Date.now().toString(),
            productId: product.id,
            userName: user.name,
            text: newComment,
            createdAt: new Date()
        };
        setComments(prev => [comment, ...prev]);
        setNewComment('');
    };

    const handleIdentify = () => {
        if (localName && localPhone) {
            onUpdateUser({ name: localName, phone: localPhone });
            setStep('LIST');
            if (newComment) {
                setTimeout(() => handlePost(), 100);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-fade-in" onClick={onClose}>
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-t-[2rem] w-full max-w-md mx-auto h-[70vh] flex flex-col shadow-2xl animate-slide-in-up">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-[2rem]">
                    <div className="text-center w-full"><h3 className="font-bold text-gray-800">Comentários</h3><p className="text-xs text-gray-500">{product.name}</p></div>
                    <button onClick={onClose} className="absolute right-4 p-2 bg-gray-200 rounded-full text-gray-600"><X size={16} /></button>
                </div>

                {step === 'LIST' ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {comments.map(c => (
                                <div key={c.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-summo-primary to-summo-secondary flex items-center justify-center text-white font-bold text-xs">{c.userName.charAt(0).toUpperCase()}</div>
                                    <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 flex-1"><p className="text-xs font-bold text-gray-900 mb-0.5">{c.userName}</p><p className="text-sm text-gray-700">{c.text}</p></div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-white pb-safe">
                            <div className="flex gap-2 items-center">
                                <input className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-summo-primary transition" placeholder="Adicione um comentário..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePost()} />
                                <button onClick={handlePost} disabled={!newComment} className="p-3 bg-summo-primary text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 transition"><Send size={18} /></button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-8 flex flex-col justify-center h-full space-y-4">
                        <div className="text-center mb-4"><h2 className="text-xl font-bold text-summo-dark">Identifique-se</h2><p className="text-gray-500 text-sm">Para comentar, precisamos saber quem é você.</p></div>
                        <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-summo-primary" placeholder="Seu Nome" value={localName} onChange={e => setLocalName(e.target.value)} />
                        <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-summo-primary" placeholder="Seu WhatsApp" value={localPhone} onChange={e => setLocalPhone(e.target.value)} />
                        <button onClick={handleIdentify} className="w-full bg-summo-primary text-white py-4 rounded-xl font-bold shadow-lg hover:bg-summo-dark transition">Continuar</button>
                        <button onClick={() => setStep('LIST')} className="w-full text-gray-400 font-medium py-2">Cancelar</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentsModal;
