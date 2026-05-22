<?php

namespace App\Notifications\Admin;

use App\Models\Partner;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class NewPartnerRegistration extends Notification implements ShouldQueue
{
    use Queueable;

    protected Partner $partner;

    /**
     * Create a new notification instance.
     */
    public function __construct(Partner $partner)
    {
        $this->partner = $partner;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Partner Registration - Action Required')
            ->greeting('Hello Admin,')
            ->line('A new partner organization has registered on the GBV Information System.')
            ->line('**Organization:** ' . $this->partner->organization_name)
            ->line('**Type:** ' . $this->getTypeLabel())
            ->line('**Contact Person:** ' . $this->partner->contact_person)
            ->line('**Email:** ' . $this->partner->email)
            ->line('**Phone:** ' . $this->partner->phone)
            ->line('**County:** ' . $this->partner->county)
            ->action('Review Registration', route('admin.partners.show', $this->partner->id))
            ->line('Please review and approve this registration to grant them access to the system.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable): array
    {
        return [
            'partner_id' => $this->partner->id,
            'organization_name' => $this->partner->organization_name,
            'contact_person' => $this->partner->contact_person,
            'type' => $this->partner->organization_type,
            'message' => 'New partner registration pending approval',
        ];
    }

    /**
     * Get organization type label.
     */
    protected function getTypeLabel(): string
    {
        return match ($this->partner->organization_type) {
            'hospital' => 'Hospital/Health Facility',
            'police' => 'Police Station/Law Enforcement',
            'ngo' => 'Non-Governmental Organization',
            'cbo' => 'Community Based Organization',
            'fbo' => 'Faith Based Organization',
            'shelter' => 'Shelter/Safe House',
            'legal' => 'Legal Aid/Justice Center',
            default => ucfirst($this->partner->organization_type),
        };
    }
}