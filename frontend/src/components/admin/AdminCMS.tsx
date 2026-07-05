import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export const AdminCMS: React.FC = () => {
  const { token } = useAuth();
  const [banners, setBanners] = useState<any[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [specialPromo, setSpecialPromo] = useState<any>(null);
  
  // Need to fetch packages to assign flash sales
  const [games, setGames] = useState<any[]>([]);
  
  // Load data
  const loadData = async () => {
    if (!token) return;
    try {
      const [bRes, fRes, sRes, gRes] = await Promise.all([
        fetch('/api/cms/banners'),
        fetch('/api/cms/flash-sales'),
        fetch('/api/cms/special-promo'),
        fetch('/api/games') // get games and packages
      ]);
      const [bData, fData, sData, gData] = await Promise.all([bRes.json(), fRes.json(), sRes.json(), gRes.json()]);
      
      if (bData.status === 'success') setBanners(bData.data.banners);
      if (fData.status === 'success') setFlashSales(fData.data.flashSales);
      if (sData.status === 'success') setSpecialPromo(sData.data.promo);
      if (gData.status === 'success') setGames(gData.data.games);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Handle Banner Submit
  const [bannerForm, setBannerForm] = useState({
    id: '', title: '', subtitle: '', imageUrl: '', colorTheme: 'from-blue-600/90 to-indigo-900/90', isActive: true, orderIndex: 0
  });
  const [showBannerForm, setShowBannerForm] = useState(false);
  
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = bannerForm.id ? 'PUT' : 'POST';
    const url = bannerForm.id ? `/api/cms/banners/${bannerForm.id}` : '/api/cms/banners';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(bannerForm)
    });
    setShowBannerForm(false);
    setBannerForm({ id: '', title: '', subtitle: '', imageUrl: '', colorTheme: 'from-blue-600/90 to-indigo-900/90', isActive: true, orderIndex: 0 });
    loadData();
  };

  const deleteBanner = async (id: string) => {
    if(!confirm('Delete this banner?')) return;
    await fetch(`/api/cms/banners/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
    loadData();
  };

  // Handle Flash Sale Submit
  const [flashForm, setFlashForm] = useState({
    id: '', packageId: '', discountPercentage: 0, endTime: '', customIconUrl: '', isActive: true
  });
  const [showFlashForm, setShowFlashForm] = useState(false);
  
  // We need flat list of packages
  const allPackages = games.flatMap(g => g.packages || []);

  const handleFlashSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = flashForm.id ? 'PUT' : 'POST';
    const url = flashForm.id ? `/api/cms/flash-sales/${flashForm.id}` : '/api/cms/flash-sales';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(flashForm)
    });
    setShowFlashForm(false);
    setFlashForm({ id: '', packageId: '', discountPercentage: 0, endTime: '', customIconUrl: '', isActive: true });
    loadData();
  };
  
  const deleteFlashSale = async (id: string) => {
    if(!confirm('Delete this flash sale?')) return;
    await fetch(`/api/cms/flash-sales/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
    loadData();
  };

  // Special Promo
  const handleSpecialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/cms/special-promo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(specialPromo)
    });
    alert('Special promo updated!');
    loadData();
  };

  return (
    <div className="space-y-12">
      {/* Promo Banners */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Hero Promo Banners</h2>
          <button onClick={() => {
            setBannerForm({ id: '', title: '', subtitle: '', imageUrl: '', colorTheme: 'from-blue-600/90 to-indigo-900/90', isActive: true, orderIndex: 0 });
            setShowBannerForm(true);
          }} className="px-3 py-1.5 bg-primary-500 text-white rounded-lg flex items-center gap-1 text-sm">
            <Plus size={14} /> Add Banner
          </button>
        </div>
        
        {showBannerForm && (
          <form onSubmit={handleBannerSubmit} className="bg-slate-100 p-4 rounded-xl mb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="Title" value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} className="p-2 rounded border" />
              <input required type="text" placeholder="Subtitle" value={bannerForm.subtitle} onChange={e => setBannerForm({...bannerForm, subtitle: e.target.value})} className="p-2 rounded border" />
              <input required type="url" placeholder="Image URL" value={bannerForm.imageUrl} onChange={e => setBannerForm({...bannerForm, imageUrl: e.target.value})} className="p-2 rounded border" />
              <input required type="text" placeholder="Color Theme classes" value={bannerForm.colorTheme} onChange={e => setBannerForm({...bannerForm, colorTheme: e.target.value})} className="p-2 rounded border" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowBannerForm(false)} className="px-4 py-2 bg-slate-300 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded">Save</button>
            </div>
          </form>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          {banners.map(b => (
            <div key={b.id} className="relative h-32 rounded-lg overflow-hidden group">
              <img src={b.imageUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 p-4 flex flex-col justify-end">
                <h3 className="text-white font-bold">{b.title}</h3>
              </div>
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setBannerForm(b); setShowBannerForm(true); }} className="p-2 bg-white/20 hover:bg-white/40 rounded backdrop-blur text-white"><Edit2 size={14} /></button>
                <button onClick={() => deleteBanner(b.id)} className="p-2 bg-red-500/80 hover:bg-red-500 rounded text-white"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flash Sales */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Flash Sales</h2>
          <button onClick={() => {
            setFlashForm({ id: '', packageId: '', discountPercentage: 0, endTime: '', customIconUrl: '', isActive: true });
            setShowFlashForm(true);
          }} className="px-3 py-1.5 bg-accent-500 text-white rounded-lg flex items-center gap-1 text-sm">
            <Plus size={14} /> Add Flash Sale
          </button>
        </div>
        
        {showFlashForm && (
          <form onSubmit={handleFlashSubmit} className="bg-slate-100 p-4 rounded-xl mb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select required value={flashForm.packageId} onChange={e => setFlashForm({...flashForm, packageId: e.target.value})} className="p-2 rounded border">
                <option value="">Select Package</option>
                {allPackages.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                ))}
              </select>
              <input required type="number" placeholder="Discount %" value={flashForm.discountPercentage} onChange={e => setFlashForm({...flashForm, discountPercentage: parseInt(e.target.value)})} className="p-2 rounded border" />
              <input required type="datetime-local" value={flashForm.endTime.slice(0,16)} onChange={e => setFlashForm({...flashForm, endTime: new Date(e.target.value).toISOString()})} className="p-2 rounded border" />
              <input type="url" placeholder="Custom Icon URL (e.g. UC image)" value={flashForm.customIconUrl} onChange={e => setFlashForm({...flashForm, customIconUrl: e.target.value})} className="p-2 rounded border" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowFlashForm(false)} className="px-4 py-2 bg-slate-300 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-accent-500 text-white rounded">Save</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-4 gap-4">
          {flashSales.map(f => (
            <div key={f.id} className="border p-4 rounded-xl bg-white flex flex-col items-center">
              {f.customIconUrl ? <img src={f.customIconUrl} className="w-16 h-16 object-contain mb-2" /> : <div className="w-16 h-16 bg-slate-200 rounded-full mb-2" />}
              <p className="font-bold text-center text-sm">{f.itemPackage?.name}</p>
              <p className="text-red-500 text-xs">-{f.discountPercentage}%</p>
              <div className="flex gap-2 mt-2">
                 <button onClick={() => deleteFlashSale(f.id)} className="p-1 bg-red-100 text-red-500 rounded"><Trash2 size={12}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Promo */}
      <div>
        <h2 className="text-xl font-bold mb-4">Special Promo Banner</h2>
        <form onSubmit={handleSpecialSubmit} className="bg-gradient-to-r from-violet-100 to-indigo-100 p-6 rounded-xl space-y-4">
          <input required type="text" placeholder="Title" value={specialPromo?.title || ''} onChange={e => setSpecialPromo({...specialPromo, title: e.target.value})} className="w-full p-2 rounded border" />
          <input required type="text" placeholder="Description" value={specialPromo?.description || ''} onChange={e => setSpecialPromo({...specialPromo, description: e.target.value})} className="w-full p-2 rounded border" />
          <div className="grid grid-cols-2 gap-4">
             <input required type="text" placeholder="Button Text" value={specialPromo?.buttonText || ''} onChange={e => setSpecialPromo({...specialPromo, buttonText: e.target.value})} className="p-2 rounded border" />
             <input required type="text" placeholder="Button Link" value={specialPromo?.buttonLink || ''} onChange={e => setSpecialPromo({...specialPromo, buttonLink: e.target.value})} className="p-2 rounded border" />
          </div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save Special Promo</button>
        </form>
      </div>

    </div>
  );
};
