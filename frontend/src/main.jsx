import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'

// ============ КОМПОНЕНТ ПРОФИЛЯ ============
const ProfileModal = ({ user, onClose, onUpdate }) => {
    const [displayName, setDisplayName] = useState(user.display_name || '')
    const [username, setUsername] = useState(user.username || '')
    const [bio, setBio] = useState(user.bio || '')
    const [phone, setPhone] = useState(user.phone || '')
    const [email, setEmail] = useState(user.email || '')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')

    const handleSave = async () => {
        if (!username.match(/^[a-zA-Z0-9_]+$/)) {
            setError('Тег может содержать только латиницу, цифры и _')
            return
        }
        
        setIsSaving(true)
        setError('')
        
        try {
            const response = await fetch(`http://localhost:8000/update-profile/${user.user_id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    display_name: displayName,
                    username: username,
                    bio: bio,
                    phone: phone,
                    email: email
                })
            })
            const data = await response.json()
            
            if (response.ok) {
                onUpdate(data)
                onClose()
            } else {
                setError(data.error || 'Ошибка сохранения')
            }
        } catch (error) {
            setError('Ошибка соединения')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }} onClick={onClose}>
            <div style={{
                background: '#1f1f2e',
                borderRadius: '20px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '85vh',
                overflow: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
                <div style={{ padding: '20px', borderBottom: '1px solid #2c2c3a' }}>
                    <h2 style={{ color: 'white', margin: 0 }}>Настройки профиля</h2>
                </div>
                
                <div style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: user.avatar_color || '#667eea',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '36px',
                            margin: '0 auto'
                        }}>
                            {(displayName[0] || username[0])?.toUpperCase()}
                        </div>
                    </div>
                    
                    {error && (
                        <div style={{ background: '#ff4444', color: 'white', padding: '10px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}
                    
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ color: '#aaa', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Имя</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #3c3c4a',
                                background: '#2c2c3a',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ color: '#aaa', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Тег (@username)</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#2c2c3a', borderRadius: '10px', padding: '0 12px', border: '1px solid #3c3c4a' }}>
                            <span style={{ color: '#667eea' }}>@</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                style={{
                                    flex: 1,
                                    padding: '12px 0',
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ color: '#aaa', display: 'block', marginBottom: '8px', fontSize: '13px' }}>📱 Номер телефона</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #3c3c4a',
                                background: '#2c2c3a',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ color: '#aaa', display: 'block', marginBottom: '8px', fontSize: '13px' }}>📧 Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #3c3c4a',
                                background: '#2c2c3a',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ color: '#aaa', display: 'block', marginBottom: '8px', fontSize: '13px' }}>О себе</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows="3"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #3c3c4a',
                                background: '#2c2c3a',
                                color: 'white',
                                outline: 'none',
                                resize: 'none'
                            }}
                            placeholder="Расскажите о себе..."
                        />
                    </div>
                </div>
                
                <div style={{ padding: '20px', borderTop: '1px solid #2c2c3a', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#2c2c3a',
                        color: 'white',
                        cursor: 'pointer'
                    }}>Отмена</button>
                    <button onClick={handleSave} disabled={isSaving} style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#667eea',
                        color: 'white',
                        cursor: 'pointer',
                        opacity: isSaving ? 0.7 : 1
                    }}>{isSaving ? 'Сохранение...' : 'Сохранить'}</button>
                </div>
            </div>
        </div>
    )
}

// ============ КОМПОНЕНТ ПОИСКА ============
const SearchModal = ({ onSelectUser, onClose }) => {
    const [query, setQuery] = useState('')
    const [searchType, setSearchType] = useState('username')
    const [results, setResults] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const search = async () => {
        if (query.length < 2) return
        
        setIsLoading(true)
        try {
            const response = await fetch(`http://localhost:8000/search/${encodeURIComponent(query)}`)
            const data = await response.json()
            setResults(data)
        } catch (error) {
            console.error('Ошибка поиска:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(search, 500)
        return () => clearTimeout(timer)
    }, [query])

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }} onClick={onClose}>
            <div style={{
                background: '#1f1f2e',
                borderRadius: '20px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '80vh',
                overflow: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
                <div style={{ padding: '20px', borderBottom: '1px solid #2c2c3a' }}>
                    <h2 style={{ color: 'white', margin: 0 }}>Новый чат</h2>
                </div>
                
                <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                        <button onClick={() => setSearchType('username')} style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '10px',
                            border: 'none',
                            background: searchType === 'username' ? '#667eea' : '#2c2c3a',
                            color: 'white',
                            cursor: 'pointer'
                        }}>🔍 По тегу/имени</button>
                        <button onClick={() => setSearchType('phone')} style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '10px',
                            border: 'none',
                            background: searchType === 'phone' ? '#667eea' : '#2c2c3a',
                            color: 'white',
                            cursor: 'pointer'
                        }}>📱 По номеру</button>
                    </div>
                    
                    <input
                        type="text"
                        placeholder={searchType === 'username' ? "Введите имя или тег..." : "Введите номер телефона..."}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid #3c3c4a',
                            background: '#2c2c3a',
                            color: 'white',
                            outline: 'none',
                            fontSize: '16px'
                        }}
                    />
                    
                    <div style={{ marginTop: '20px' }}>
                        {isLoading && <div style={{ color: '#888', textAlign: 'center' }}>Поиск...</div>}
                        
                        {results.map(user => (
                            <div
                                key={user.id}
                                onClick={() => onSelectUser(user)}
                                style={{
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    borderRadius: '10px',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#2c2c3a'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: user.avatar_color || '#667eea',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px'
                                }}>
                                    {user.display_name[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ color: 'white', fontWeight: 'bold' }}>{user.display_name}</div>
                                    <div style={{ color: '#888', fontSize: '12px' }}>@{user.username}</div>
                                    <div style={{ color: '#666', fontSize: '11px' }}>{user.phone}</div>
                                </div>
                            </div>
                        ))}
                        
                        {results.length === 0 && query.length >= 2 && !isLoading && (
                            <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                                Ничего не найдено
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============ ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ ============
const ConfirmModal = ({ chat, onConfirm, onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }} onClick={onClose}>
            <div style={{
                background: '#1f1f2e',
                borderRadius: '20px',
                width: '320px',
                padding: '24px',
                textAlign: 'center'
            }} onClick={(e) => e.stopPropagation()}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
                <h3 style={{ color: 'white', marginBottom: '8px' }}>Удалить чат?</h3>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
                    Чат с <strong>{chat?.name}</strong> будет удалён. Все сообщения будут стёрты.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#2c2c3a',
                        color: 'white',
                        cursor: 'pointer'
                    }}>Отмена</button>
                    <button onClick={onConfirm} style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#ff4444',
                        color: 'white',
                        cursor: 'pointer'
                    }}>Удалить</button>
                </div>
            </div>
        </div>
    )
}

// ============ ОСНОВНОЙ КОМПОНЕНТ ============
function App() {
    const [user, setUser] = useState(null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [chats, setChats] = useState([])
    const [currentChat, setCurrentChat] = useState(null)
    const [showProfile, setShowProfile] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [showConfirmDelete, setShowConfirmDelete] = useState(false)
    const [chatToDelete, setChatToDelete] = useState(null)
    const wsRef = useRef(null)

    // Загрузка пользователя из localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem('messenger_user')
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
    }, [])

    // Сохранение пользователя
    useEffect(() => {
        if (user) {
            localStorage.setItem('messenger_user', JSON.stringify(user))
        }
    }, [user])

    useEffect(() => {
        if (user?.user_id) {
            const ws = new WebSocket(`ws://localhost:8000/ws/${user.user_id}`)
            wsRef.current = ws
            ws.onopen = () => console.log('✅ WebSocket подключен')
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data)
                if (data.type === 'new_message') {
                    setMessages(prev => [...prev, {
                        id: data.message.id,
                        from: data.message.from,
                        text: data.message.text,
                        timestamp: data.message.timestamp
                    }])
                    loadChats()
                } else if (data.type === 'message_sent') {
                    setMessages(prev => [...prev, {
                        id: data.message.id,
                        from: user.user_id,
                        text: data.message.text,
                        timestamp: data.message.timestamp
                    }])
                }
            }
            return () => ws.close()
        }
    }, [user])

    const loadChats = async () => {
        if (user?.user_id) {
            const res = await fetch(`http://localhost:8000/chats/${user.user_id}`)
            const data = await res.json()
            setChats(data)
        }
    }

    useEffect(() => {
        loadChats()
    }, [user])

    useEffect(() => {
        if (user?.user_id && currentChat?.id) {
            fetch(`http://localhost:8000/messages/${user.user_id}/${currentChat.id}`)
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(console.error)
        }
    }, [user, currentChat])

    const sendMessage = () => {
        if (wsRef.current && input.trim() && currentChat) {
            wsRef.current.send(JSON.stringify({
                type: 'message',
                to: currentChat.username,
                text: input
            }))
            setInput('')
        }
    }

    const startChat = (selectedUser) => {
        const existingChat = chats.find(c => c.id === selectedUser.id)
        if (existingChat) {
            setCurrentChat(existingChat)
        } else {
            const newChat = {
                id: selectedUser.id,
                name: selectedUser.display_name,
                username: selectedUser.username,
                last_message: '',
                unread: 0
            }
            setChats(prev => [newChat, ...prev])
            setCurrentChat(newChat)
        }
        setShowSearch(false)
    }

    const deleteChat = async () => {
        if (chatToDelete && user?.user_id) {
            await fetch(`http://localhost:8000/chat/${user.user_id}/${chatToDelete.id}`, {
                method: 'DELETE'
            })
            setChats(prev => prev.filter(c => c.id !== chatToDelete.id))
            if (currentChat?.id === chatToDelete.id) {
                setCurrentChat(null)
                setMessages([])
            }
            setShowConfirmDelete(false)
            setChatToDelete(null)
        }
    }

    const handleUpdateUser = (updatedUser) => {
        setUser(updatedUser)
        // Обновляем имя в чатах
        setChats(prev => prev.map(chat => ({
            ...chat,
            name: chat.id === updatedUser.user_id ? updatedUser.display_name : chat.name
        })))
        if (currentChat && currentChat.id === updatedUser.user_id) {
            setCurrentChat(prev => ({ ...prev, name: updatedUser.display_name }))
        }
    }

    if (!user) {
        return <LoginScreen onLogin={setUser} />
    }

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#0e0e12' }}>
            {/* Левая панель */}
            <div style={{ width: '320px', background: '#1f1f2e', borderRight: '1px solid #2c2c3a', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #2c2c3a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: 'white', margin: 0 }}>💬 Чаты</h3>
                    <button onClick={() => setShowSearch(true)} style={{ background: '#667eea', border: 'none', borderRadius: '10px', padding: '5px 12px', color: 'white', cursor: 'pointer' }}>+ Новый</button>
                </div>
                
                <div style={{ flex: 1, overflow: 'auto' }}>
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                background: currentChat?.id === chat.id ? '#2c2c3a' : 'transparent',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#2c2c3a'}
                            onMouseLeave={(e) => {
                                if (currentChat?.id !== chat.id) e.currentTarget.style.background = 'transparent'
                            }}
                        >
                            <div style={{ flex: 1 }} onClick={() => setCurrentChat(chat)}>
                                <div style={{ color: 'white', fontWeight: 'bold' }}>{chat.name}</div>
                                <div style={{ color: '#888', fontSize: '12px' }}>@{chat.username}</div>
                                {chat.last_message && (
                                    <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>{chat.last_message.slice(0, 30)}</div>
                                )}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setChatToDelete(chat)
                                    setShowConfirmDelete(true)
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#888',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    padding: '8px',
                                    opacity: 0.5
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                    {chats.length === 0 && (
                        <div style={{ color: '#666', textAlign: 'center', padding: '32px' }}>
                            Нет чатов<br />
                            Нажмите + Новый
                        </div>
                    )}
                </div>
                
                <div onClick={() => setShowProfile(true)} style={{
                    padding: '16px',
                    borderTop: '1px solid #2c2c3a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                }} onMouseEnter={(e) => e.currentTarget.style.background = '#2c2c3a'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: user.avatar_color || '#667eea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                    }}>
                        {(user.display_name || user.username)?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: 'white' }}>{user.display_name || user.username}</div>
                        <div style={{ fontSize: '11px', color: '#4ade80' }}>● Онлайн</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>@{user.username}</div>
                </div>
            </div>

            {/* Правая панель - чат */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {currentChat ? (
                    <>
                        <div style={{ padding: '16px', borderBottom: '1px solid #2c2c3a', background: '#1f1f2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ color: 'white', margin: 0 }}>{currentChat.name}</h3>
                                <div style={{ fontSize: '12px', color: '#888' }}>@{currentChat.username}</div>
                            </div>
                            <button
                                onClick={() => {
                                    setChatToDelete(currentChat)
                                    setShowConfirmDelete(true)
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#888',
                                    cursor: 'pointer',
                                    padding: '8px'
                                }}
                            >
                                🗑️ Удалить чат
                            </button>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                            {messages.map((msg, i) => (
                                <div key={i} style={{ marginBottom: '12px', textAlign: msg.from === user.user_id ? 'right' : 'left' }}>
                                    <div style={{ display: 'inline-block', background: msg.from === user.user_id ? '#667eea' : '#2c2c3a', color: 'white', padding: '10px 14px', borderRadius: '12px', maxWidth: '60%' }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: '16px', borderTop: '1px solid #2c2c3a', background: '#1f1f2e', display: 'flex', gap: '12px' }}>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Сообщение..."
                                style={{ flex: 1, padding: '12px', borderRadius: '20px', border: 'none', background: '#2c2c3a', color: 'white', outline: 'none' }}
                            />
                            <button onClick={sendMessage} style={{ background: '#667eea', border: 'none', borderRadius: '20px', padding: '0 20px', color: 'white', cursor: 'pointer' }}>📤</button>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ fontSize: '64px' }}>💬</div>
                        <div>Выберите чат или создайте новый</div>
                        <button onClick={() => setShowSearch(true)} style={{ background: '#667eea', border: 'none', borderRadius: '10px', padding: '10px 20px', color: 'white', cursor: 'pointer' }}>+ Новый чат</button>
                    </div>
                )}
            </div>

            {showProfile && (
                <ProfileModal
                    user={user}
                    onClose={() => setShowProfile(false)}
                    onUpdate={handleUpdateUser}
                />
            )}
            
            {showSearch && (
                <SearchModal
                    onSelectUser={startChat}
                    onClose={() => setShowSearch(false)}
                />
            )}
            
            {showConfirmDelete && chatToDelete && (
                <ConfirmModal
                    chat={chatToDelete}
                    onConfirm={deleteChat}
                    onClose={() => {
                        setShowConfirmDelete(false)
                        setChatToDelete(null)
                    }}
                />
            )}
        </div>
    )
}

// ============ ЭКРАН ВХОДА ============
const LoginScreen = ({ onLogin }) => {
    const [phone, setPhone] = useState('')
    const [username, setUsername] = useState('')
    const [code, setCode] = useState('')
    const [step, setStep] = useState('phone')
    const [isLoading, setIsLoading] = useState(false)

    const sendCode = async () => {
        if (!phone.trim() || !username.trim()) {
            alert('Заполните все поля')
            return
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            alert('Тег может содержать только латиницу, цифры и _')
            return
        }
        setIsLoading(true)
        try {
            await fetch('http://localhost:8000/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            })
            setStep('code')
        } catch (error) {
            alert('Ошибка соединения')
        } finally {
            setIsLoading(false)
        }
    }

    const verifyCode = async () => {
        if (!code.trim()) return
        setIsLoading(true)
        try {
            const response = await fetch('http://localhost:8000/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, code, username })
            })
            const data = await response.json()
            if (data.user_id) {
                onLogin(data)
            } else {
                alert('Неверный код')
            }
        } catch (error) {
            alert('Ошибка соединения')
        } finally {
            setIsLoading(false)
        }
    }

    if (step === 'phone') {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'fixed',
                top: 0,
                left: 0
            }}>
                <div style={{
                    background: '#1f1f2e',
                    borderRadius: '28px',
                    padding: '40px',
                    width: '90%',
                    maxWidth: '420px',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{
                            width: '70px',
                            height: '70px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            fontSize: '36px'
                        }}>💬</div>
                    </div>
                    <h1 style={{ color: 'white', marginBottom: '8px', fontSize: '28px' }}>Добро пожаловать</h1>
                    <p style={{ color: '#888', marginBottom: '32px' }}>Создайте аккаунт чтобы начать</p>
                    
                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label style={{ color: '#aaa', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Ваш тег (username)</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#2c2c3a', borderRadius: '14px', padding: '0 16px', border: '1px solid #3c3c4a' }}>
                            <span style={{ color: '#667eea', fontWeight: 'bold' }}>@</span>
                            <input type="text" placeholder="alex" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} style={{ flex: 1, padding: '16px 0', background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '16px', marginLeft: '8px' }} autoFocus />
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>Только латиница, цифры и _</div>
                    </div>
                    
                    <div style={{ marginBottom: '28px', textAlign: 'left' }}>
                        <label style={{ color: '#aaa', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Номер телефона</label>
                        <input type="tel" placeholder="+7 (999) 123-45-67" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid #3c3c4a', background: '#2c2c3a', color: 'white', outline: 'none', fontSize: '16px' }} />
                    </div>
                    
                    <button onClick={sendCode} disabled={isLoading} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: isLoading ? '#4a4a5a' : '#667eea', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                        {isLoading ? 'Отправка...' : 'Продолжить →'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'fixed',
            top: 0,
            left: 0
        }}>
            <div style={{ background: '#1f1f2e', borderRadius: '28px', padding: '40px', width: '90%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '36px' }}>✉️</div>
                </div>
                <h1 style={{ color: 'white', marginBottom: '8px', fontSize: '28px' }}>Подтверждение</h1>
                <p style={{ color: '#888', marginBottom: '8px' }}>Мы отправили код на номер</p>
                <p style={{ color: '#667eea', marginBottom: '32px', fontWeight: 'bold' }}>{phone}</p>
                
                <div style={{ marginBottom: '28px', textAlign: 'left' }}>
                    <label style={{ color: '#aaa', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Код из SMS</label>
                    <input type="text" placeholder="• • • • • •" value={code} onChange={(e) => setCode(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid #3c3c4a', background: '#2c2c3a', color: 'white', outline: 'none', fontSize: '20px', textAlign: 'center', letterSpacing: '8px' }} autoFocus maxLength={6} />
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '6px', textAlign: 'center' }}>Демо-код: <span style={{ color: '#667eea', fontWeight: 'bold' }}>123456</span></div>
                </div>
                
                <button onClick={verifyCode} disabled={isLoading} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: isLoading ? '#4a4a5a' : '#667eea', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                    {isLoading ? 'Проверка...' : 'Войти →'}
                </button>
                
                <button onClick={() => setStep('phone')} style={{ width: '100%', padding: '12px', borderRadius: '14px', border: 'none', background: 'transparent', color: '#888', fontSize: '14px', cursor: 'pointer', marginTop: '16px' }}>← Изменить номер</button>
            </div>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)