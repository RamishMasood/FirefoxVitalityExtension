import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FileText, Key, Lock, Save } from "lucide-react";
import { storage, StorageKeys } from "@/lib/storage";

interface FormData {
  id: string;
  url: string;
  fields: {
    selector: string;
    value: string;
  }[];
}

interface SecureNote {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export default function FormTools() {
  const [forms, setForms] = useState<FormData[]>([]);
  const [notes, setNotes] = useState<SecureNote[]>([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const { toast } = useToast();

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    const savedForms = await storage.get<FormData[]>('savedForms') || [];
    const savedNotes = await storage.get<SecureNote[]>(StorageKeys.USER_PREFERENCES + '_notes') || [];
    setForms(savedForms);
    setNotes(savedNotes);
  };

  const saveCurrentForm = async () => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      
      const result = await browser.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => {
          const inputs = document.querySelectorAll('input:not([type="hidden"])');
          return Array.from(inputs).map(input => ({
            selector: getUniqueSelector(input),
            value: (input as HTMLInputElement).value
          }));

          function getUniqueSelector(element: Element): string {
            if (element.id) return `#${element.id}`;
            if (element.className) {
              const classes = element.className.split(' ').join('.');
              return `.${classes}`;
            }
            let selector = element.tagName.toLowerCase();
            const siblings = element.parentElement?.children || [];
            if (siblings.length > 1) {
              const index = Array.from(siblings).indexOf(element);
              selector += `:nth-child(${index + 1})`;
            }
            return selector;
          }
        }
      });

      const formData: FormData = {
        id: crypto.randomUUID(),
        url: tab.url!,
        fields: result[0].result
      };

      const updated = [...forms, formData];
      await storage.set('savedForms', updated);
      setForms(updated);

      toast({
        title: "Form Saved",
        description: "Form data has been saved for auto-fill"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save form data",
        variant: "destructive"
      });
    }
  };

  const autoFillForm = async () => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      const savedForm = forms.find(f => f.url === tab.url);

      if (!savedForm) {
        toast({
          title: "No Data Found",
          description: "No saved form data for this page",
          variant: "destructive"
        });
        return;
      }

      await browser.scripting.executeScript({
        target: { tabId: tab.id! },
        func: (fields) => {
          fields.forEach(({ selector, value }) => {
            const input = document.querySelector(selector) as HTMLInputElement;
            if (input) input.value = value;
          });
        },
        args: [savedForm.fields]
      });

      toast({
        title: "Form Filled",
        description: "Saved data has been auto-filled"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not auto-fill form",
        variant: "destructive"
      });
    }
  };

  const saveSecureNote = async () => {
    if (!newNote.title || !newNote.content) {
      toast({
        title: "Error",
        description: "Please provide both title and content",
        variant: "destructive"
      });
      return;
    }

    const note: SecureNote = {
      id: crypto.randomUUID(),
      title: newNote.title,
      content: newNote.content,
      timestamp: Date.now()
    };

    const updated = [note, ...notes];
    await storage.set(StorageKeys.USER_PREFERENCES + '_notes', updated);
    setNotes(updated);
    setNewNote({ title: "", content: "" });

    toast({
      title: "Note Saved",
      description: "Secure note has been saved"
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Form Auto-fill</h3>
          <div className="flex gap-2">
            <Button onClick={saveCurrentForm} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Save Current Form
            </Button>
            <Button onClick={autoFillForm} variant="secondary" className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Auto-fill Form
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Secure Notes</h3>
          <Input
            placeholder="Note Title"
            value={newNote.title}
            onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
          />
          <Textarea
            placeholder="Secure content..."
            value={newNote.content}
            onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
            className="min-h-[100px]"
          />
          <Button onClick={saveSecureNote} className="w-full">
            <Lock className="mr-2 h-4 w-4" />
            Save Secure Note
          </Button>
        </div>

        {notes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Saved Notes</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="p-2 border rounded">
                  <div className="font-medium">{note.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(note.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
