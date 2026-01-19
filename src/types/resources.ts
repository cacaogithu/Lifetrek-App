export interface Resource {
    id: string;
    title: string;
    description: string;
    content: string;
    type: 'checklist' | 'guide' | 'calculator';
    persona?: string;
    thumbnail_url?: string;
    status: 'draft' | 'published';
    slug: string;
    metadata: any;
    user_id?: string;
    created_at: string;
    updated_at: string;
}

export type ResourceInsert = Omit<Resource, 'id' | 'created_at' | 'updated_at'>;
export type ResourceUpdate = Partial<ResourceInsert> & { id: string };
