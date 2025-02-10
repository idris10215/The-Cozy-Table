import { Component, OnInit } from "@angular/core";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";
import { FormsModule, NgForm } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Feedback } from "../../models/user.model";
import { ChangeDetectorRef } from "@angular/core";

@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.css"],
})
export class UserListComponent implements OnInit {
  userList: Feedback[] = [];

  errorMessage: string = "";
  editingIndex: number | null = null;
  editingUser: Partial<Feedback> = {};
  loggedInUserId: string | null = "";
  loggedInUserRole: string = "";
  replyingUserId: any;
  replyMessage: string = "";
  feedbackSubmitted: boolean = false; // Track if feedback is submitted
  searchQuery: string = "";
  noMatchesFound: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loggedInUserId = localStorage.getItem("userId");
    this.loggedInUserRole = localStorage.getItem("userRole") || "";
    this.fetchFeedback();
  }

  fetchFeedback(): void {
    this.userService.getFeedback().subscribe({
      next: (data: Feedback[]) => {
        if (this.loggedInUserRole === "Admin") {
          this.userList = data;
        } else if (this.loggedInUserId) {
          this.userList = data.filter(
            (feedback) => feedback.uId === this.loggedInUserId
          );
        }

        // Check if feedback is already submitted by the logged-in user
        this.feedbackSubmitted = this.userList.length > 0; // Set to true if feedback exists
      },
      error: (err) => {
        this.errorMessage =
          "Failed to load feedback data. Please try again later.";
        console.error(err);
      },
    });
  }

  navigateToRegistration(): void {
    this.router.navigate(["/feedback"]);
    // Set feedbackSubmitted to true after navigating to feedback page
    this.feedbackSubmitted = true;
  }

  startEdit(index: number): void {
    this.editingIndex = index;
    this.editingUser = { ...this.userList[index] };
  }

  saveEdit(uId: string): void {
    if (this.editingIndex !== null) {
      this.userService.updateFeedback(uId, this.editingUser).subscribe({
        next: (updatedUser: Feedback) => {
          this.userList[this.editingIndex!] = updatedUser;
          this.editingIndex = null;
          this.editingUser = {};
          alert("Feedback updated successfully");
        },
        error: (err: any) => {
          this.errorMessage =
            "Failed to update the feedback. Please try again later.";
          console.error(err);
        },
      });
    }
  }

  cancelEdit(): void {
    this.editingIndex = null;
    this.editingUser = {};
  }

  deleteUser(uId: string): void {
    const confirmDelete = confirm(
      "Are you sure you want to delete this feedback?"
    );
    if (confirmDelete) {
      this.userService.deleteFeedback(uId).subscribe({
        next: () => {
          this.userList = this.userList.filter((user) => user.uId !== uId);
          if (this.userList.length === 0) {
            this.feedbackSubmitted = false; // Re-enable the button if feedback is deleted
          }
          alert("Feedback deleted successfully!");
          location.reload();
        },
        error: (err: any) => {
          this.errorMessage =
            "Failed to delete the feedback. Please try again later.";
          console.error(err);
        },
      });
    }
  }

  replyToUser(uId: string): void {
    this.replyingUserId = uId;
    this.replyMessage = "";
  }

  sendReply(uId: string): void {
    if (!this.replyMessage.trim()) {
      this.errorMessage = "Reply message cannot be empty.";
      setTimeout(() => {
        location.reload();
      }, 2000);
      return;
    }

    this.userService.sendReply(uId, this.replyMessage).subscribe({
      next: () => {
        const user = this.userList.find((u) => u.uId === uId);
        if (user) {
          if (!user.replies) {
            user.replies = [];
          }
          user.replies.push({
            message: this.replyMessage,
            timestamp: new Date().toLocaleString(),
          });
        }
        alert("Reply added successfully!");
        location.reload();
        this.cancelReply();
      },
      error: (err: any) => {
        console.error("Error adding reply:", err);
        this.errorMessage = "Failed to add the reply. Please try again.";
      },
    });
  }

  cancelReply(): void {
    this.replyingUserId = null;
    this.replyMessage = "";
  }

  toggleShowReplies(uId: string): void {
    const user = this.userList.find((u) => u.uId === uId);
    if (user) {
      user.showReplies = !user.showReplies;
    }
  }

  getStars(rating: number): number[] {
    return Array(rating)
      .fill(0)
      .map((_, i) => i + 1);
  }

  sortFeedback(order: "asc" | "desc"): void {
    if (order === "asc") {
      this.userList.sort((a, b) => a.rating - b.rating);
    } else {
      this.userList.sort((a, b) => b.rating - a.rating);
    }
  }
  searchUsers(): void {
    if (this.loggedInUserRole === "Admin") {
      this.userList = this.userList.filter(
        (user) =>
          user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.feedback.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      if (this.userList.length === 0) {
        // Display no matches message (optional)
        this.noMatchesFound = true;
      } else {
        this.noMatchesFound = false;
      }

      if (this.searchQuery === "") {
        location.reload();
      }
    }
  }
}
