import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Appointments = () => {
    const { t } = useTranslation();
    const token = localStorage.getItem('token');
    const today = new Date().toISOString().split('T')[0];
    
    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]);
    const [vets, setVets] = useState([]);
    const [myAnimals, setMyAnimals] = useState([]);

    const [newApp, setNewApp] = useState({
        animal_id: '',
        vet_id: '',
        service_id: '',
        date: ''
    });

    const fetchData = useCallback(async () => {
        const authHeader = { headers: { Authorization: token } };
        try {
            const resApps = await axios.get('http://localhost:3001/appointments', authHeader);
            setAppointments(resApps.data);

            const resForm = await axios.get('http://localhost:3001/form-data', authHeader);
            setServices(resForm.data.services);
            setVets(resForm.data.vets);

            const resAnimals = await axios.get('http://localhost:3001/my-animals', authHeader);
            setMyAnimals(resAnimals.data);

        } catch (err) {
            console.error(err);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const authHeader = { headers: { Authorization: token } };
        if (newApp.date < today) {
            alert("Nie można umawiać wizyt w przeszłości!");
            return; 
        }
        try {
            await axios.post('http://localhost:3001/appointments', newApp, authHeader);
            alert(t('app_success'));
            fetchData();
            setNewApp(prev => ({ ...prev, date: '' }));
        } catch (err) {
            alert('Błąd: ' + err.response?.data?.message);
        }
    };

    return (
        <section className="card-section">
            <h2>{t('menu_appointments')}</h2>

            <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
                <h3>{t('book_app')}</h3>
                <form onSubmit={handleSubmit} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                    
                    <select required onChange={e => setNewApp({...newApp, animal_id: e.target.value})} value={newApp.animal_id}>
                        <option value="">-- {t('select_animal')} --</option>
                        {myAnimals.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>

                    <select required onChange={e => setNewApp({...newApp, service_id: e.target.value})} value={newApp.service_id}>
                        <option value="">-- {t('select_service')} --</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.price} PLN)</option>)}
                    </select>

                    <select required onChange={e => setNewApp({...newApp, vet_id: e.target.value})} value={newApp.vet_id}>
                        <option value="">-- {t('select_vet')} --</option>
                        {vets.map(v => <option key={v.id} value={v.id}>lek. {v.first_name} {v.second_name}</option>)}
                    </select>

                    <input type="datetime-local" required 
                           onChange={e => setNewApp({...newApp, date: e.target.value})} value={newApp.date} min={today}/>

                    <button type="submit" className="primary" style={{gridColumn: 'span 2'}}>
                        {t('btn_book')}
                    </button>
                </form>
            </div>

            <h3>{t('app_history')}</h3>
            <table>
                <thead>
                    <tr>
                        <th>{t('app_date')}</th>
                        <th>{t('app_patient')}</th>
                        <th>{t('app_service')}</th>
                        <th>{t('app_vet')}</th>
                        <th>{t('app_status')}</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.length > 0 ? appointments.map(app => (
                        <tr key={app.id}>
                            <td>{new Date(app.appointment_date).toLocaleString()}</td>
                            <td><strong>{app.animal_name}</strong></td>
                            <td>{app.service_name} <small>({app.price} PLN)</small></td>
                            <td>lek. {app.vet_name}</td>
                            <td>
                                <span style={{
                                    padding: '5px 10px', 
                                    borderRadius: '15px', 
                                    fontSize: '0.8em'
                                }}>
                                    {app.status === 'scheduled' ? t('status_scheduled') : app.status}
                                </span>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>{t('no_data')}</td></tr>
                    )}
                </tbody>
            </table>
        </section>
    );
};

export default Appointments;