
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { JobTable } from '@/components/admin/JobTable';
import { useJobNotifications } from '@/hooks/useJobNotifications';
import { Job } from '@/types/jobs';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

type PageItem = number | 'ellipsis';

const buildPagination = (current: number, total: number): PageItem[] => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }

    const items: PageItem[] = [];
    const showLeftEllipsis = current > 4;
    const showRightEllipsis = current < total - 3;

    items.push(1);

    if (showLeftEllipsis) {
        items.push('ellipsis');
    }

    const start = showLeftEllipsis ? current - 1 : 2;
    const end = showRightEllipsis ? current + 1 : total - 1;

    for (let page = start; page <= end; page += 1) {
        items.push(page);
    }

    if (showRightEllipsis) {
        items.push('ellipsis');
    }

    items.push(total);

    return items;
};

export function JobMonitor() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState('');
    const [debouncedType, setDebouncedType] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useJobNotifications();

    const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)), [totalCount]);
    const paginationItems = useMemo(() => buildPagination(page, totalPages), [page, totalPages]);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('jobs')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }

            if (debouncedType) {
                query = query.ilike('job_type', `%${debouncedType}%`);
            }

            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data, count, error } = await query.range(from, to);

            if (error) throw error;

            setJobs((data ?? []) as Job[]);
            setTotalCount(count ?? 0);
        } catch (error) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    }, [debouncedType, filterStatus, page]);

    useEffect(() => {
        const handle = setTimeout(() => {
            setDebouncedType(filterType.trim());
        }, 300);

        return () => clearTimeout(handle);
    }, [filterType]);

    useEffect(() => {
        setPage((current) => (current === 1 ? current : 1));
    }, [filterStatus, debouncedType]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    useEffect(() => {
        // Subscribe to ALL changes to keep table fresh
        const channel = supabase
            .channel('jobs-monitor-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'jobs'
            }, () => {
                fetchJobs();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchJobs]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Job Monitor</h1>
                    <p className="text-muted-foreground">Monitor and manage background tasks.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="queued">Queued</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        value={filterType}
                        onChange={(event) => setFilterType(event.target.value)}
                        placeholder="Filter by type"
                        className="w-[220px]"
                    />
                    <Button variant="outline" size="icon" onClick={fetchJobs} disabled={loading}>
                        <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <JobTable jobs={jobs} loading={loading} />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
                <span>
                    Showing {totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                    {' '}
                    -
                    {' '}
                    {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
                </span>

                <Pagination className="sm:mx-0">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(event) => {
                                    event.preventDefault();
                                    setPage((current) => Math.max(1, current - 1));
                                }}
                                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>

                        {paginationItems.map((item, index) => (
                            <PaginationItem key={`${item}-${index}`}>
                                {item === 'ellipsis' ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        href="#"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setPage(item);
                                        }}
                                        isActive={item === page}
                                    >
                                        {item}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(event) => {
                                    event.preventDefault();
                                    setPage((current) => Math.min(totalPages, current + 1));
                                }}
                                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}

// Default export for lazy loading
export default JobMonitor;
