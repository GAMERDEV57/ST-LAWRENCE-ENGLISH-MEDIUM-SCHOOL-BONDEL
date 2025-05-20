import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import type { FunctionReference, OptionalRestArgs, DefaultFunctionArgs } from "convex/server";

interface EditableItem {
  _id: Id<any>;
  title?: string;
  name?: string;
  content?: string;
  description?: string;
  venue?: string;
  date?: number;
  imageId?: Id<"_storage"> | null;
  imageUrl?: string | null;
  important?: boolean;
}

function ImageUpload({ onUpload, existingImageUrl, onClearImage }: { 
  onUpload: (storageId: Id<"_storage">) => void;
  existingImageUrl?: string | null;
  onClearImage?: () => void;
}) {
  const generateUploadUrl = useMutation(api.school.generateUploadUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null | undefined>(existingImageUrl);

  useEffect(() => {
    setPreviewUrl(existingImageUrl);
  }, [existingImageUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file)); 

    try {
      setUploading(true);
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      onUpload(storageId);
    } catch (error) {
      toast.error("Failed to upload image");
      setPreviewUrl(existingImageUrl); 
    } finally {
      setUploading(false);
    }
  };
  
  const handleClearImage = () => {
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
    if (onClearImage) onClearImage();
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-red-50 file:text-red-700
          hover:file:bg-red-100"
      />
      {uploading && (
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-500"
        >
          Uploading...
        </motion.span>
      )}
      {previewUrl && (
        <div className="mt-2 relative group">
          <img src={previewUrl} alt="Preview" className="h-32 w-auto rounded-md object-cover border border-gray-300" />
          <button 
            type="button"
            onClick={handleClearImage}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove image"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}


function AdminManager() {
  const setAdmin = useMutation(api.school.setAdmin);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email cannot be empty.");
      return;
    }
    try {
      await setAdmin({ email });
      setEmail("");
      toast.success(`Admin access granted to ${email}`);
    } catch (error: any) {
      toast.error(error.data?.message || error.message || "Failed to grant admin access");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
    >
      <h3 className="text-xl font-semibold mb-6 text-red-800">Grant Admin Access</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">
            User's Email Address
          </label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Grant Admin Access
        </motion.button>
      </form>
    </motion.div>
  );
}

interface ManagerProps<
  TItem extends EditableItem,
  TListArgs extends DefaultFunctionArgs,
  TAddArgs extends DefaultFunctionArgs, 
  TDeleteArgs extends DefaultFunctionArgs & { id: Id<any> }, 
  TEditArgs extends DefaultFunctionArgs & { id: Id<any> } 
> {
  title: string;
  itemTypeLabel: string;
  listItemsQuery: FunctionReference<"query", "public", TListArgs, TItem[] | undefined>;
  listItemsArgs: TListArgs; 
  addItemMutation: FunctionReference<"mutation", "public", TAddArgs, Id<any> | null | void>;
  deleteItemMutation: FunctionReference<"mutation", "public", TDeleteArgs, null | void>;
  editItemMutation: FunctionReference<"mutation", "public", TEditArgs, null | void>;
  formFields: (
    item: Partial<TItem>,
    setItem: React.Dispatch<React.SetStateAction<Partial<TItem>>>,
    setImageId: (id: Id<"_storage"> | null) => void,
    existingImageUrl?: string | null
  ) => React.ReactNode;
  initialState: Partial<TItem>;
  getDisplayFields: (item: TItem) => { title: string; details: string[]; imageUrl?: string | null };
  transformSubmitPayload: (
    formState: Partial<TItem>, 
    currentImageId: Id<"_storage"> | null
  ) => Omit<TAddArgs, 'id'> | Omit<TEditArgs, 'id'>; 
}

function GenericManager<
  TItem extends EditableItem,
  TListArgs extends DefaultFunctionArgs,
  TAddArgs extends DefaultFunctionArgs, 
  TDeleteArgs extends DefaultFunctionArgs & { id: Id<any> },
  TEditArgs extends DefaultFunctionArgs & { id: Id<any> }
>({
  title,
  itemTypeLabel,
  listItemsQuery,
  listItemsArgs,
  addItemMutation,
  deleteItemMutation,
  editItemMutation,
  formFields,
  initialState,
  getDisplayFields,
  transformSubmitPayload,
}: ManagerProps<TItem, TListArgs, TAddArgs, TDeleteArgs, TEditArgs>) {
  const items = useQuery(listItemsQuery, listItemsArgs); // Simplified: pass args directly
  
  const addItem = useMutation(addItemMutation);
  const deleteItem = useMutation(deleteItemMutation);
  const editItem = useMutation(editItemMutation);

  const [currentItem, setCurrentItem] = useState<Partial<TItem>>(initialState);
  const [imageId, setImageId] = useState<Id<"_storage"> | null>(null);
  const [isEditing, setIsEditing] = useState<Id<any> | null>(null);

  const resetForm = () => {
    setCurrentItem(initialState);
    setImageId(null);
    setIsEditing(null);
  };

  const handleEdit = (item: TItem) => {
    setIsEditing(item._id);
    const editState: Partial<TItem> = { ...initialState, ...item };
    setCurrentItem(editState);
    setImageId(item.imageId || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const mutationArgsData = transformSubmitPayload(
        currentItem,
        imageId
      );

      if (isEditing) {
        // Pass arguments object directly
        await editItem({ id: isEditing, ...mutationArgsData } as TEditArgs);
        toast.success(`${itemTypeLabel} updated successfully!`);
      } else {
        // Pass arguments object directly
        await addItem(mutationArgsData as TAddArgs);
        toast.success(`${itemTypeLabel} added successfully!`);
      }
      resetForm();
    } catch (error: any) {    
      console.error(`Failed to ${isEditing ? 'update' : 'add'} ${itemTypeLabel.toLowerCase()}:`, error);
      const convexError = error.data;
      let message = `Failed to ${isEditing ? 'update' : 'add'} ${itemTypeLabel.toLowerCase()}`;
      if (typeof convexError === 'string') {
        message = convexError;
      } else if (convexError && typeof convexError.message === 'string') {
        message = convexError.message;
      } else if (convexError && typeof convexError.data === 'string') { 
        message = convexError.data;
      }
      else if (error.message) {
        message = error.message;
      }
      toast.error(message);
    }
  };
  
  const handleDelete = async (id: Id<any>) => {
    if (window.confirm(`Are you sure you want to delete this ${itemTypeLabel.toLowerCase()}?`)) {
      try {
        // Pass arguments object directly
        await deleteItem({ id } as TDeleteArgs);
        toast.success(`${itemTypeLabel} deleted successfully!`);
        if (isEditing === id) resetForm();
      } catch (error: any) {
        toast.error(error.data?.message || error.message || `Failed to delete ${itemTypeLabel.toLowerCase()}`);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h3 className="text-xl font-semibold mb-6 text-red-800">
          {isEditing ? `Edit ${itemTypeLabel}` : `Add New ${itemTypeLabel}`}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formFields(currentItem, setCurrentItem, setImageId, isEditing ? (items?.find(i => i._id === isEditing) as TItem)?.imageUrl : undefined)}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              {isEditing ? `Update ${itemTypeLabel}` : `Add ${itemTypeLabel}`}
            </motion.button>
            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel Edit
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-red-800">Current {title}</h3>
        {items && items.length === 0 && <p className="text-gray-600 bg-white p-4 rounded-lg shadow border">No {title.toLowerCase()} found.</p>}
        <AnimatePresence>
          {items?.map((item) => {
            const display = getDisplayFields(item);
            return (
              <motion.div
                key={item._id as string}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    {display.imageUrl && (
                      <img 
                        src={display.imageUrl} 
                        alt={display.title}
                        className="mb-3 rounded-lg max-h-40 sm:max-h-48 w-auto object-cover border border-gray-200"
                      />
                    )}
                    <h4 className="text-lg sm:text-xl font-semibold text-red-700">{display.title}</h4>
                    {display.details.map((detail, index) => (
                      <p key={index} className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{detail}</p>
                    ))}
                  </div>
                  <div className="flex-shrink-0 flex sm:flex-col gap-2 mt-2 sm:mt-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(item)}
                      className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors"
                      aria-label="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                      aria-label="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const announcementFormFields = (
  item: Partial<EditableItem>, 
  setItem: React.Dispatch<React.SetStateAction<Partial<EditableItem>>>,
  setImageId: (id: Id<"_storage"> | null) => void,
  existingImageUrl?: string | null
) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
      <input type="text" value={item.title || ""} onChange={(e) => setItem(prev => ({...prev, title: e.target.value}))} placeholder="Announcement Title" required className="input-field"/>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
      <textarea value={item.content || ""} onChange={(e) => setItem(prev => ({...prev, content: e.target.value}))} placeholder="Announcement Content" required className="input-field h-32"/>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
      <ImageUpload 
        onUpload={(id) => setImageId(id)} 
        existingImageUrl={existingImageUrl}
        onClearImage={() => {
          setImageId(null); 
          setItem(prev => ({...prev, imageId: null, imageUrl: null}));
        }}
      />
    </div>
    <div className="flex items-center">
      <input type="checkbox" id="importantAnnouncement" checked={item.important || false} onChange={(e) => setItem(prev => ({...prev, important: e.target.checked}))} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"/>
      <label htmlFor="importantAnnouncement" className="ml-2 block text-sm text-gray-900">Mark as important</label>
    </div>
  </>
);

const eventFormFields = (
  item: Partial<EditableItem>, 
  setItem: React.Dispatch<React.SetStateAction<Partial<EditableItem>>>,
  setImageId: (id: Id<"_storage"> | null) => void,
  existingImageUrl?: string | null
) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
      <input type="text" value={item.title || ""} onChange={(e) => setItem(prev => ({...prev, title: e.target.value}))} placeholder="Event Title" required className="input-field"/>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea value={item.description || ""} onChange={(e) => setItem(prev => ({...prev, description: e.target.value}))} placeholder="Event Description" required className="input-field h-24"/>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
      <input type="text" value={item.venue || ""} onChange={(e) => setItem(prev => ({...prev, venue: e.target.value}))} placeholder="Event Venue" required className="input-field"/>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
      <input type="date" value={item.date ? new Date(item.date).toISOString().split('T')[0] : ""} onChange={(e) => setItem(prev => ({...prev, date: new Date(e.target.value).getTime()}))} required className="input-field"/>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
      <ImageUpload 
        onUpload={(id) => setImageId(id)} 
        existingImageUrl={existingImageUrl}
        onClearImage={() => {
          setImageId(null);
          setItem(prev => ({...prev, imageId: null, imageUrl: null}));
        }}
      />
    </div>
  </>
);

const facilityFormFields = (
  item: Partial<EditableItem>, 
  setItem: React.Dispatch<React.SetStateAction<Partial<EditableItem>>>,
  setImageId: (id: Id<"_storage"> | null) => void,
  existingImageUrl?: string | null
) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
      <input type="text" value={item.name || ""} onChange={(e) => setItem(prev => ({...prev, name: e.target.value}))} placeholder="Facility Name" required className="input-field"/>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea value={item.description || ""} onChange={(e) => setItem(prev => ({...prev, description: e.target.value}))} placeholder="Facility Description" required className="input-field h-24"/>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
      <ImageUpload 
        onUpload={(id) => setImageId(id)} 
        existingImageUrl={existingImageUrl}
        onClearImage={() => {
          setImageId(null);
          setItem(prev => ({...prev, imageId: null, imageUrl: null}));
        }}
      />
    </div>
  </>
);

const achievementFormFields = (
  item: Partial<EditableItem>, 
  setItem: React.Dispatch<React.SetStateAction<Partial<EditableItem>>>,
  setImageId: (id: Id<"_storage"> | null) => void,
  existingImageUrl?: string | null
) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
      <input type="text" value={item.title || ""} onChange={(e) => setItem(prev => ({...prev, title: e.target.value}))} placeholder="Achievement Title" required className="input-field"/>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea value={item.description || ""} onChange={(e) => setItem(prev => ({...prev, description: e.target.value}))} placeholder="Achievement Description" required className="input-field h-24"/>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
      <ImageUpload 
        onUpload={(id) => setImageId(id)} 
        existingImageUrl={existingImageUrl}
        onClearImage={() => {
          setImageId(null);
          setItem(prev => ({...prev, imageId: null, imageUrl: null}));
        }}
      />
    </div>
  </>
);


export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("announcements");
  
  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }
  };

  const tabs = [
    { id: "admin", label: "Manage Admins" },
    { id: "announcements", label: "Announcements" },
    { id: "events", label: "Events" },
    { id: "facilities", label: "Facilities" },
    { id: "achievements", label: "Achievements" }
  ];

  type AnnouncementListArgs = typeof api.school.listAnnouncements._args;
  type AnnouncementAddArgs = typeof api.school.addAnnouncement._args;
  type AnnouncementDeleteArgs = typeof api.school.deleteAnnouncement._args;
  type AnnouncementEditArgs = typeof api.school.editAnnouncement._args;

  type EventListArgs = typeof api.school.listEvents._args;
  type EventAddArgs = typeof api.school.addEvent._args;
  type EventDeleteArgs = typeof api.school.deleteEvent._args;
  type EventEditArgs = typeof api.school.editEvent._args;

  type FacilityListArgs = typeof api.school.listFacilities._args;
  type FacilityAddArgs = typeof api.school.addFacility._args;
  type FacilityDeleteArgs = typeof api.school.deleteFacility._args;
  type FacilityEditArgs = typeof api.school.editFacility._args;
  
  type AchievementListArgs = typeof api.school.listAchievements._args;
  type AchievementAddArgs = typeof api.school.addAchievement._args;
  type AchievementDeleteArgs = typeof api.school.deleteAchievement._args;
  type AchievementEditArgs = typeof api.school.editAchievement._args;


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-red-800 tracking-tight"
      >
        Admin Dashboard
      </motion.h2>
      
      <div className="mb-6 sm:mb-8">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-red-500 focus:ring-red-500 py-2 px-3"
            defaultValue={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>{tab.label}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-red-600 text-red-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={tabVariants}
        >
          {activeTab === "admin" && <AdminManager />}
          {activeTab === "announcements" && (
            <GenericManager<EditableItem, AnnouncementListArgs, AnnouncementAddArgs, AnnouncementDeleteArgs, AnnouncementEditArgs>
              title="Announcements"
              itemTypeLabel="Announcement"
              listItemsQuery={api.school.listAnnouncements}
              listItemsArgs={{}} 
              addItemMutation={api.school.addAnnouncement}
              deleteItemMutation={api.school.deleteAnnouncement}
              editItemMutation={api.school.editAnnouncement}
              formFields={announcementFormFields}
              initialState={{ title: "", content: "", important: false }} 
              getDisplayFields={(item: EditableItem) => ({ 
                title: item.title!,
                details: [
                  item.content!,
                  `Date: ${new Date(item.date!).toLocaleDateString()}`, 
                  item.important ? "Status: Important" : "Status: Regular"
                ],
                imageUrl: item.imageUrl
              })}
              transformSubmitPayload={(formState, currentImageId) => ({
                title: formState.title!,
                content: formState.content!,
                important: formState.important || false,
                imageId: currentImageId ?? undefined, // Convert null to undefined
              })}
            />
          )}
          {activeTab === "events" && (
             <GenericManager<EditableItem, EventListArgs, EventAddArgs, EventDeleteArgs, EventEditArgs>
              title="Events"
              itemTypeLabel="Event"
              listItemsQuery={api.school.listEvents}
              listItemsArgs={{}}
              addItemMutation={api.school.addEvent}
              deleteItemMutation={api.school.deleteEvent}
              editItemMutation={api.school.editEvent}
              formFields={eventFormFields}
              initialState={{ title: "", description: "", venue: "", date: Date.now() }} 
              getDisplayFields={(item: EditableItem) => ({
                title: item.title!,
                details: [
                  item.description!,
                  `Venue: ${item.venue}`,
                  `Date: ${new Date(item.date!).toLocaleDateString()}`
                ],
                imageUrl: item.imageUrl
              })}
              transformSubmitPayload={(formState, currentImageId) => ({
                title: formState.title!,
                description: formState.description!,
                venue: formState.venue!,
                date: formState.date!, 
                imageId: currentImageId ?? undefined, // Convert null to undefined
              })}
            />
          )}
          {activeTab === "facilities" && (
            <GenericManager<EditableItem, FacilityListArgs, FacilityAddArgs, FacilityDeleteArgs, FacilityEditArgs>
              title="Facilities"
              itemTypeLabel="Facility"
              listItemsQuery={api.school.listFacilities}
              listItemsArgs={{}}
              addItemMutation={api.school.addFacility}
              deleteItemMutation={api.school.deleteFacility}
              editItemMutation={api.school.editFacility}
              formFields={facilityFormFields}
              initialState={{ name: "", description: "" }}
              getDisplayFields={(item: EditableItem) => ({
                title: item.name!,
                details: [item.description!],
                imageUrl: item.imageUrl
              })}
              transformSubmitPayload={(formState, currentImageId) => ({
                name: formState.name!,
                description: formState.description!,
                imageId: currentImageId ?? undefined, // Convert null to undefined
              })}
            />
          )}
          {activeTab === "achievements" && (
            <GenericManager<EditableItem, AchievementListArgs, AchievementAddArgs, AchievementDeleteArgs, AchievementEditArgs>
              title="Achievements"
              itemTypeLabel="Achievement"
              listItemsQuery={api.school.listAchievements}
              listItemsArgs={{}}
              addItemMutation={api.school.addAchievement}
              deleteItemMutation={api.school.deleteAchievement}
              editItemMutation={api.school.editAchievement}
              formFields={achievementFormFields}
              initialState={{ title: "", description: "" }} 
              getDisplayFields={(item: EditableItem) => ({
                title: item.title!,
                details: [
                  item.description!,
                  `Date: ${new Date(item.date!).toLocaleDateString()}` 
                ],
                imageUrl: item.imageUrl
              })}
              transformSubmitPayload={(formState, currentImageId) => ({
                title: formState.title!,
                description: formState.description!,
                imageId: currentImageId ?? undefined, // Convert null to undefined
              })}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
