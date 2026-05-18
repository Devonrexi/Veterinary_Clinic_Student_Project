import React from 'react';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const { t } = useTranslation();

    return (
        <section className="card-section">
            <h2>{t('home_welcome')}</h2>
            <p>{t('home_desc')}</p>
            <img 
                src="/images/clinic.jpg" 
                alt="Clinic Interior" 
                style={{width: '100%', borderRadius: '10px', marginTop: '20px'}} 
            />
        </section>
    );
};

export default Home;