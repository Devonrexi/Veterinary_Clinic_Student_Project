import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AnimalsList = ({ mode }) => { 
    const { t } = useTranslation();
    const [animals, setAnimals] = useState([]);
    
    const [formData, setFormData] = useState({ name: '', species: 'pies', breed: '', birth_date: '' });
    const [editingId, setEditingId] = useState(null); 

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 

    const token = localStorage.getItem('token');
    
    const fetchAnimals = useCallback(async () => {
        const authHeader = { headers: { Authorization: token } };
        try {
            const endpoint = mode === 'all' 
                ? 'http://localhost:3001/all-animals' 
                : 'http://localhost:3001/my-animals';
            
            const res = await axios.get(endpoint, authHeader);
            setAnimals(res.data);
        } catch (err) { console.error(err); }
    }, [mode, token]);

    useEffect(() => { fetchAnimals(); }, [fetchAnimals]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const authHeader = { headers: { Authorization: token } };
        
        try {
            if (editingId) {
                await axios.put(`http://localhost:3001/animals/${editingId}`, formData, authHeader);
                alert(t('btn_save') + ' OK!');
                setEditingId(null); 
            } else {
                await axios.post('http://localhost:3001/animals', formData, authHeader);
                alert(t('btn_add') + ' OK!');
            }

            fetchAnimals(); 
            setFormData({ name: '', species: 'pies', breed: '', birth_date: '' });
        } catch (err) {
            alert('Error: ' + err.response?.data?.message);
        }
    };

    const startEditing = (animal) => {
        setEditingId(animal.id);
        const formattedDate = new Date(animal.birth_date).toISOString().split('T')[0];
        setFormData({
            name: animal.name,
            species: animal.species,
            breed: animal.breed,
            birth_date: formattedDate
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', species: 'pies', breed: '', birth_date: '' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('delete_confirm'))) return;
        try {
            await axios.delete(`http://localhost:3001/animals/${id}`, { headers: { Authorization: token } });
            fetchAnimals();
        } catch (err) { alert("Błąd usuwania"); }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAnimals = animals.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(animals.length / itemsPerPage);

    const translateSpecies = (dbValue) => {
        if (!dbValue) return "";
        const key = `val_${dbValue.toLowerCase()}`;
        return t(key, { defaultValue: dbValue });
    };

    return (
        <section className="card-section">
            <h2>{mode === 'all' ? t('all_animals') : t('my_animals')}</h2>

            {mode === 'my' && (
                <div style={{ backgroundColor: editingId ? '#fff3cd' : '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: editingId ? '2px solid #ffecb5' : 'none' }}>
                    <h3>
                        {editingId ? `${t('edit_mode')}` : `+ ${t('add_animal')}`}
                    </h3>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <input placeholder={t('name')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            <select value={formData.species} onChange={e => setFormData({...formData, species: e.target.value})} style={{padding: '12px', border: '1px solid #ccc', borderRadius: '4px'}}>
                                <option value="pies">{t('val_pies')}</option>
                                <option value="kot">{t('val_kot')}</option>
                                <option value="krolik">{t('val_krolik')}</option>
                                <option value="chomik">{t('val_chomik')}</option>
                                <option value="papuga">{t('val_papuga')}</option>
                                <option value="inne">{t('val_inne')}</option>
                            </select>
                            <input placeholder={t('breed')} value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} required />
                            <input type="date" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} required />
                        </div>
                        
                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            <button type="submit" className="primary">
                                {editingId ? t('btn_save') : t('btn_add')}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} className="danger" style={{backgroundColor: 'gray'}}>
                                    {t('btn_cancel')}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <h3>{t('list_title')}</h3> 
            
            <table>
                <thead>
                    <tr>
                        <th>{t('name')}</th>
                        <th>{t('species')}</th>
                        <th>{t('breed')}</th>
                        <th>{t('birth_date')}</th>
                        {mode === 'all' && <th style={{backgroundColor: '#d9534f'}}>{t('owner')}</th>}
                        <th style={{width: '140px'}}>{t('table_actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {currentAnimals.length > 0 ? (
                        currentAnimals.map(animal => (
                            <tr key={animal.id}>
                                <td><strong>{animal.name}</strong></td>
                                <td>{translateSpecies(animal.species)}</td>
                                <td>{animal.breed}</td>
                                <td>{new Date(animal.birth_date).toLocaleDateString()}</td>
                                {mode === 'all' && (
                                    <td>{animal.owner_name} {animal.second_name}<br/><small style={{color: 'gray'}}>{animal.email || animal.owner_email}</small></td>
                                )}
                                <td>
                                    {mode === 'my' && (
                                        <button onClick={() => startEditing(animal)} style={{marginRight: '5px', padding: '5px 8px', cursor: 'pointer', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px'}}>
                                            {t('btn_edit')}
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(animal.id)} className="danger" style={{padding: '5px 8px', fontSize: '0.9em'}}>
                                        {t('btn_delete')}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={mode === 'all' ? 7 : 7} style={{textAlign: 'center', padding: '20px'}}>{t('no_data')}</td></tr>
                    )}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ padding: '8px 15px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                        &laquo; {t('prev')}
                    </button>
                    
                    <span>{t('page')} <strong>{currentPage}</strong> / {totalPages}</span>
                    
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{ padding: '8px 15px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                        {t('next')} &raquo;
                    </button>
                </div>
            )}
        </section>
    );
};

export default AnimalsList;