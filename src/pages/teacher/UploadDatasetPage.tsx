import { useCallback, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { studentAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadDatasetPage() {
  const { fetchStudents } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ count: number; message: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!f.name.endsWith('.csv') && f.type !== 'text/csv') {
      toast.error('Please upload a CSV file only');
      return;
    }
    setFile(f);
    setResult(null);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] || null);
  }, [handleFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0] || null);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await studentAPI.uploadCSV(file);
      setResult({ count: res.data.length, message: res.message });
      toast.success(res.message || `${res.data.length} students imported to database!`);
      // Refresh student list
      await fetchStudents();
    } catch (err: any) {
      toast.error(err.message || 'CSV upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Upload Dataset</h1>
        <p className="text-muted-foreground text-sm">Import student data from a CSV file — all data is saved to the database</p>
      </div>

      <div className="stat-card space-y-4">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Drag & drop your CSV file here, or click to browse
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <Button variant="outline" asChild>
            <label htmlFor="csv-upload" className="cursor-pointer">Choose CSV File</label>
          </Button>
        </div>

        {/* Selected File */}
        {file && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            {result && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm font-medium text-green-700">
              ✅ {result.count} students imported successfully!
            </p>
            <p className="text-xs text-green-600 mt-1">All records have been saved to the database.</p>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || uploading || !!result}
          className="w-full"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading to Database...</>
          ) : result ? (
            <><CheckCircle className="h-4 w-4 mr-2" /> Uploaded Successfully</>
          ) : (
            <><Upload className="h-4 w-4 mr-2" /> Upload & Import to Database</>
          )}
        </Button>

        {result && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => { setFile(null); setResult(null); }}
          >
            Upload Another File
          </Button>
        )}
      </div>

      {/* CSV Format Guide */}
      <div className="stat-card space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Required CSV Format</h3>
        <p className="text-xs text-muted-foreground">
          Only <code>name</code> and <code>rollNumber</code> are required. All other columns are optional and default to 0/false.
        </p>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Academic</p>
          <div className="bg-muted rounded p-2 overflow-x-auto">
            <code className="text-[10px] text-muted-foreground whitespace-nowrap">
              attendancePercentage, internalMarks, assignmentCompletion, previousFailures, engagementScore
            </code>
          </div>

          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Financial</p>
          <div className="bg-muted rounded p-2 overflow-x-auto">
            <code className="text-[10px] text-muted-foreground whitespace-nowrap">
              familyIncome, travelDistance, scholarshipStatus (none/partial/full), partTimeJob (true/false), numberOfDependents
            </code>
          </div>

          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Behavioural</p>
          <div className="bg-muted rounded p-2 overflow-x-auto">
            <code className="text-[10px] text-muted-foreground whitespace-nowrap">
              disciplinaryActions, socialMediaHours, extracurricularParticipation (true/false)
            </code>
          </div>

          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Medical</p>
          <div className="bg-muted rounded p-2 overflow-x-auto">
            <code className="text-[10px] text-muted-foreground whitespace-nowrap">
              hasChronicIllness (true/false), mentalHealthConcern (true/false), missedDueMedical
            </code>
          </div>

          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Optional identity columns</p>
          <div className="bg-muted rounded p-2 overflow-x-auto">
            <code className="text-[10px] text-muted-foreground whitespace-nowrap">
              email, phoneNumber
            </code>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1 pt-1">
          <p>Example row:</p>
          <div className="bg-muted rounded p-2 overflow-x-auto">
            <code className="text-[10px] text-muted-foreground whitespace-nowrap">
              John Doe,CS2024007,75,68,80,0,70,45000,10,partial,false,1,0,3,false,false,false,0
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
