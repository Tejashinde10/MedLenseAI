import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LoginRequiredModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Login Required
          </DialogTitle>

          <DialogDescription className="text-center mt-2">
            To continue, please login or create an account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-5">
          <Button
            className="w-full"
            onClick={() => {
              onClose();
              navigate("/login");
            }}
          >
            Login
          </Button>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              onClose();
              navigate("/Register");
            }}
          >
            Create Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginRequiredModal;
