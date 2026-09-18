import React, { useState } from 'react';
import { INITIAL_SERVICES } from '../../store/initialData';
import { ServiceCategory } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Search, ArrowRight, Check, Wrench, Zap, Sparkles, Hammer, Paintbrush, Cpu, HeartHandshake, Package, Users } from 'lucide-react';

interface ServicesPageProps {
  onSelectService: (serviceName: string, problemType?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onSelectService }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench': return <Wrench className="w-5 h-5 text-teal-700" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-sky-600" />;
      case 'Hammer': return <Hammer className="w-5 h-5 text-orange-600" />;
      case 'Paintbrush': return <Paintbrush className="w-5 h-5 text-indigo-600" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-purple-600" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-rose-600" />;
      case 'Package': return <Package className="w-5 h-5 text-emerald-600" />;
      default: return <Users className="w-5 h-5 text-teal-700" />;
    }
  };

  const filteredServices = INITIAL_SERVICES.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.problems.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = !selectedCategory || s.id === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <Badge variant="coop" className="mb-2">
          Verified Service Catalog
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#292824] leading-tight">
          Household & Community Services
        </h1>
        <p className="text-[#524E47] mt-2 text-sm sm:text-base font-normal">
          All services are performed by verified cooperative members adhering to standardized community rates and transparent splits.
        </p>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for repair, installation, cleaning..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent shadow-subtle placeholder:text-slate-400"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
              selectedCategory === null
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Services ({INITIAL_SERVICES.length})
          </button>
          {INITIAL_SERVICES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedCategory(s.id === selectedCategory ? null : s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === s.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {getServiceIcon(service.iconName)}
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#77736B] block">Coop Base Rate</span>
                  <span className="text-base font-bold font-mono text-[#292824]">₹{service.basePrice}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#292824] tracking-tight mb-1">
                {service.name}
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                {service.description}
              </p>

              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Common Requests:
                </span>
                {service.problems.slice(0, 4).map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectService(service.name, p)}
                    className="w-full text-left text-xs text-slate-700 hover:text-teal-800 hover:bg-slate-50 px-2 py-1 rounded flex items-center justify-between group transition-colors"
                  >
                    <span className="truncate">{p}</span>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => onSelectService(service.name)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Request {service.name}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
