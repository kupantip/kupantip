'use client';

import * as React from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Report, useUpdateReportStatus } from '@/services/admin/report';
import { ReportDetailsDialog } from './ReportDetailsDialog';
import { BanUserDialog } from './BanUserDialog';
import { toast } from 'sonner';

type ReportDataTableProps = {
    data: Report[];
};

export function ReportDataTable({ data }: ReportDataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [selectedReport, setSelectedReport] = React.useState<Report | null>(
        null
    );
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [banDialogOpen, setBanDialogOpen] = React.useState(false);
    const [reportToBan, setReportToBan] = React.useState<Report | null>(null);

    const { mutate: updateStatus, isPending } = useUpdateReportStatus();

    const handleViewDetails = (id: string) => {
        const report = data.find((r) => String(r.id) === id);
        if (report) {
            setSelectedReport(report);
            setDialogOpen(true);
        }
    };

    const handleApprove = (id: string) => {
        const report = data.find((r) => String(r.id) === id);
        if (report) {
            setReportToBan(report);
            setBanDialogOpen(true);
        }
    };

    const handleBanSuccess = () => {
        if (reportToBan) {
            updateStatus(
                { id: String(reportToBan.id), status: 'actioned' },
                {
                    onSuccess: () => {
                        toast.success('Report Approved', {
                            description:
                                'Action has been taken on this report.',
                        });
                        setReportToBan(null);
                    },
                }
            );
        }
    };

    const handleReject = (id: string) => {
        updateStatus(
            { id, status: 'dismissed' },
            {
                onSuccess: () => {
                    toast.success('Report Dismissed', {
                        description: 'The report has been dismissed.',
                    });
                },
                onError: () => {
                    toast.error('Error', {
                        description:
                            'Failed to dismiss report. Please try again.',
                    });
                },
            }
        );
    };

    const columns: ColumnDef<Report>[] = [
        {
            accessorKey: 'id',
            header: 'Report ID',
            cell: ({ row }) => (
                <div className="font-mono text-sm">
                    {String(row.getValue('id')).slice(0, 8)}...
                </div>
            ),
        },
        {
            accessorKey: 'target_type',
            header: 'Target Type',
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue('target_type')}</div>
            ),
        },
        {
            accessorKey: 'target_id',
            header: 'Target ID',
            cell: ({ row }) => (
                <div className="font-mono text-sm">
                    {String(row.getValue('target_id')).slice(0, 8)}...
                </div>
            ),
        },
        {
            accessorKey: 'reason',
            header: 'Reason',
            cell: ({ row }) => {
                const reason = String(row.getValue('reason'));
                return (
                    <div className="max-w-xs truncate" title={reason}>
                        {reason}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="h-8 w-full justify-start"
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const status = String(row.getValue('status'));
                const statusColor =
                    status === 'open'
                        ? 'bg-yellow-100 text-yellow-800'
                        : status === 'actioned'
                        ? 'bg-green-100 text-green-800'
                        : status === 'dismissed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800';
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="h-8 w-full justify-start"
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(String(row.getValue('created_at')));
                return <div>{date.toLocaleDateString()}</div>;
            },
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const report = row.original;
                const isOpen = report.status === 'open';

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 cursor-pointer"
                                aria-label="Open menu"
                                disabled={isPending}
                            >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() =>
                                    handleViewDetails(String(report.id))
                                }
                            >
                                View Details
                            </DropdownMenuItem>
                            {isOpen && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleApprove(String(report.id))
                                        }
                                        className="text-green-600 focus:text-green-600"
                                        disabled={isPending}
                                    >
                                        Approve & Ban User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleReject(String(report.id))
                                        }
                                        className="text-red-600 focus:text-red-600"
                                        disabled={isPending}
                                    >
                                        {isPending
                                            ? 'Processing...'
                                            : 'Dismiss'}
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="w-full space-y-4">
            {/* Filters & Controls */}
            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder="Filter by reason..."
                    value={
                        (table
                            .getColumn('reason')
                            ?.getFilterValue() as string) || ''
                    }
                    onChange={(event) =>
                        table
                            .getColumn('reason')
                            ?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) =>
                                        column.toggleVisibility(!!value)
                                    }
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="whitespace-nowrap">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className='hover:scale-101 whitespace-nowrap'>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>

            <ReportDetailsDialog
                report={selectedReport}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />

            {reportToBan && (
                <BanUserDialog
                    reportId={String(reportToBan.reporter_id)}
                    userId={reportToBan.reported_user_id}
                    open={banDialogOpen}
                    onOpenChange={setBanDialogOpen}
                    onSuccess={handleBanSuccess}
                />
            )}
        </div>
    );
}