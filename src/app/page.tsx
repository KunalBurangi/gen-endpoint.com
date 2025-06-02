"use client";

import { useState, useMemo } from 'react';
import { publicApis, apiCategories, type ApiDefinition } from '@/data/apis';
import { ApiCard } from '@/components/ApiCard';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredApis = useMemo(() => {
    return publicApis.filter(api => {
      const matchesSearch = api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            api.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            api.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || api.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card rounded-lg shadow-md">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">Discover Public APIs</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore a curated collection of free public APIs to power your next project, or use our AI tools to generate custom API responses.
        </p>
      </section>

      <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-card rounded-lg shadow">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search APIs by name, description, or category..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search APIs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]" aria-label="Filter by category">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {apiCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredApis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApis.map(api => (
            <ApiCard key={api.id} api={api} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No APIs found matching your criteria.</p>
          { (searchTerm || selectedCategory !== 'all') && 
            <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategory('all');}}>Clear filters</Button>
          }
        </div>
      )}
    </div>
  );
}
